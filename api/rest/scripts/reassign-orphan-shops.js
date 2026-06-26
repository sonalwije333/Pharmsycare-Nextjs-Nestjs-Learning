/*
 * After reducing to a single Medicine shop, demo rows that referenced the
 * removed shops now point to a non-existent shop, which crashes admin pages
 * that assume the related shop exists.
 *
 * This reassigns every orphaned shop reference to the Medicine shop instead of
 * deleting the data (non-destructive).
 */
const mysql = require('mysql2/promise');

const DB = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3307),
  user: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '78563',
  database: process.env.DB_NAME || 'pharmsycaredb',
};

// table -> shop foreign key column(s)
const SHOP_FK_TABLES = {
  withdraws: ['shop_id'],
  coupons: ['shop_id'],
  conversations: ['shop_id'],
  shippings: ['shop_id', 'shopId'],
  refunds: ['shop_id', 'shopId'],
  refund_policies: ['shop_id', 'shopId'],
  terms_and_conditions: ['shop_id'],
  faqs: ['shop_id'],
  store_notices: ['shop_id'],
  questions: ['shop_id'],
  attributes: ['shop_id'],
  attribute_values: ['shop_id'],
  authors: ['shop_id'],
  prescriptions: ['shop_id'],
  prescription_history: ['shop_id'],
  reorder_requests: ['shop_id'],
};

async function columnExists(c, table, column) {
  const [rows] = await c.query(
    `SELECT COUNT(*) AS n FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [DB.database, table, column],
  );
  return rows[0].n > 0;
}

(async () => {
  const c = await mysql.createConnection(DB);

  const [[medShop]] = await c.query(
    `SELECT id FROM shops WHERE slug = 'medicine' OR LOWER(name) = 'medicine' LIMIT 1`,
  );
  if (!medShop) {
    console.error('No medicine shop found. Aborting.');
    await c.end();
    process.exit(1);
  }
  const shopId = medShop.id;
  console.log(`Reassigning orphaned shop references to shop_id = ${shopId}\n`);

  await c.query('SET FOREIGN_KEY_CHECKS = 0');

  for (const [table, columns] of Object.entries(SHOP_FK_TABLES)) {
    for (const col of columns) {
      if (!(await columnExists(c, table, col))) continue;
      try {
        const [res] = await c.query(
          `UPDATE \`${table}\` SET \`${col}\` = ?
           WHERE \`${col}\` IS NOT NULL
             AND \`${col}\` NOT IN (SELECT id FROM shops)`,
          [shopId],
        );
        if (res.affectedRows > 0) {
          console.log(`  ✓ ${table}.${col}: reassigned ${res.affectedRows} row(s)`);
        }
      } catch (e) {
        console.log(`  ! ${table}.${col} skipped: ${e.message}`);
      }
    }
  }

  await c.query('SET FOREIGN_KEY_CHECKS = 1');
  await c.end();
  console.log('\nDone.');
})().catch((e) => {
  console.error('ERR', e.message);
  process.exit(1);
});
