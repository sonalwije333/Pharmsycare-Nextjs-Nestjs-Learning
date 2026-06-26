/*
 * PharmSy-Care: reduce the live database to a Medicine-only (pharmacy) scenario.
 *
 * Removes all non-medicine catalog data:
 *   - products / categories / manufacturers / types that are not Medicine
 *   - product-dependent rows (reviews, questions, wishlists, supplier/reorder links)
 *   - non-medicine shops (store owners are reassigned to the Medicine shop)
 *
 * Medicine type_id is resolved by slug ('medicine'); the Medicine shop by slug/name.
 *
 * Usage: node scripts/medicine-only-cleanup.js
 */
const mysql = require('mysql2/promise');

const DB = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3307),
  user: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '78563',
  database: process.env.DB_NAME || 'pharmsycaredb',
  multipleStatements: true,
};

async function tableExists(c, name) {
  const [rows] = await c.query(
    `SELECT COUNT(*) AS n FROM information_schema.TABLES
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?`,
    [DB.database, name],
  );
  return rows[0].n > 0;
}

async function columnExists(c, table, column) {
  const [rows] = await c.query(
    `SELECT COUNT(*) AS n FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [DB.database, table, column],
  );
  return rows[0].n > 0;
}

async function run(c, label, sql, params = []) {
  try {
    const [res] = await c.query(sql, params);
    const affected = res && typeof res.affectedRows === 'number' ? res.affectedRows : 0;
    console.log(`  ✓ ${label} (${affected} rows)`);
    return affected;
  } catch (e) {
    console.log(`  ! ${label} skipped: ${e.message}`);
    return 0;
  }
}

(async () => {
  const c = await mysql.createConnection(DB);
  console.log(`Connected to ${DB.host}:${DB.port}/${DB.database}`);

  // Resolve the medicine type id and medicine shop id.
  const [[medType]] = await c.query(
    `SELECT id FROM types WHERE slug = 'medicine' LIMIT 1`,
  );
  if (!medType) {
    console.error('No "medicine" type found. Aborting.');
    await c.end();
    process.exit(1);
  }
  const medicineTypeId = medType.id;

  const [[medShop]] = await c.query(
    `SELECT id FROM shops WHERE slug = 'medicine' OR LOWER(name) = 'medicine' LIMIT 1`,
  );
  const medicineShopId = medShop ? medShop.id : null;

  console.log(`Medicine type_id = ${medicineTypeId}`);
  console.log(`Medicine shop_id = ${medicineShopId ?? '(none found)'}`);

  await c.query('SET FOREIGN_KEY_CHECKS = 0');
  await c.query('START TRANSACTION');

  try {
    console.log('\nRemoving product-dependent rows for non-medicine products...');
    const subNonMed = `(SELECT id FROM products WHERE type_id <> ${medicineTypeId})`;

    if (await tableExists(c, 'reviews')) {
      if (await columnExists(c, 'reviews', 'product_id'))
        await run(c, 'reviews.product_id', `DELETE FROM reviews WHERE product_id IN ${subNonMed}`);
      if (await columnExists(c, 'reviews', 'productId'))
        await run(c, 'reviews.productId', `DELETE FROM reviews WHERE productId IN ${subNonMed}`);
    }
    if (await tableExists(c, 'questions'))
      await run(c, 'questions', `DELETE FROM questions WHERE product_id IN ${subNonMed}`);
    if (await tableExists(c, 'wishlists')) {
      if (await columnExists(c, 'wishlists', 'product_id'))
        await run(c, 'wishlists.product_id', `DELETE FROM wishlists WHERE product_id IN ${subNonMed}`);
      if (await columnExists(c, 'wishlists', 'productId'))
        await run(c, 'wishlists.productId', `DELETE FROM wishlists WHERE productId IN ${subNonMed}`);
    }
    if (await tableExists(c, 'product_suppliers'))
      await run(c, 'product_suppliers', `DELETE FROM product_suppliers WHERE product_id IN ${subNonMed}`);
    if (await tableExists(c, 'reorder_requests'))
      await run(c, 'reorder_requests', `DELETE FROM reorder_requests WHERE product_id IN ${subNonMed}`);
    if (await tableExists(c, 'top_rate_products'))
      await run(c, 'top_rate_products', `DELETE FROM top_rate_products WHERE type_id <> ${medicineTypeId} OR product_id IN ${subNonMed}`);
    if (await tableExists(c, 'category_wise_products'))
      await run(
        c,
        'category_wise_products',
        `DELETE FROM category_wise_products WHERE category_id IN (SELECT id FROM categories WHERE type_id <> ${medicineTypeId})`,
      );

    console.log('\nRemoving non-medicine catalog rows...');
    await run(c, 'products', `DELETE FROM products WHERE type_id <> ${medicineTypeId}`);
    await run(c, 'categories', `DELETE FROM categories WHERE type_id <> ${medicineTypeId}`);
    if (await tableExists(c, 'manufacturers'))
      await run(c, 'manufacturers', `DELETE FROM manufacturers WHERE type_id <> ${medicineTypeId}`);
    await run(c, 'types', `DELETE FROM types WHERE id <> ${medicineTypeId}`);

    if (medicineShopId != null) {
      console.log('\nRemoving non-medicine shops...');
      if (await columnExists(c, 'users', 'shopId'))
        await run(
          c,
          'users.shopId -> medicine shop',
          `UPDATE users SET shopId = ${medicineShopId} WHERE shopId IS NOT NULL AND shopId <> ${medicineShopId}`,
        );
      await run(c, 'shops', `DELETE FROM shops WHERE id <> ${medicineShopId}`);
    } else {
      console.log('\nSkipping shop cleanup (no medicine shop resolved).');
    }

    await c.query('COMMIT');
    console.log('\nCOMMIT done.');
  } catch (e) {
    await c.query('ROLLBACK');
    console.error('\nROLLBACK due to error:', e.message);
    await c.query('SET FOREIGN_KEY_CHECKS = 1');
    await c.end();
    process.exit(1);
  }

  await c.query('SET FOREIGN_KEY_CHECKS = 1');

  // Verification
  console.log('\nVerification (remaining rows):');
  for (const [label, sql] of [
    ['types', 'SELECT id,name,slug FROM types'],
    ['shops', 'SELECT id,name,slug FROM shops'],
    ['products by type', 'SELECT type_id, COUNT(*) c FROM products GROUP BY type_id'],
    ['categories by type', 'SELECT type_id, COUNT(*) c FROM categories GROUP BY type_id'],
  ]) {
    const [rows] = await c.query(sql);
    console.log(`  ${label}: ${JSON.stringify(rows)}`);
  }

  await c.end();
  console.log('\nDone.');
})().catch((e) => {
  console.error('FATAL', e.message);
  process.exit(1);
});
