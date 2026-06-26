/*
 * Remove product_suppliers mappings that reference products no longer present
 * in the Medicine-only catalog.
 */
const mysql = require('mysql2/promise');

const DB = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3307),
  user: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '78563',
  database: process.env.DB_NAME || 'pharmsycaredb',
};

(async () => {
  const res = await fetch('http://localhost:9000/api/products?limit=1000&page=1');
  const json = await res.json();
  const data = json.data || json;
  const medicineIds = (data || [])
    .map((p) => Number(p.id))
    .filter((n) => !Number.isNaN(n));

  if (!medicineIds.length) {
    console.error('Could not resolve medicine product ids from API. Aborting.');
    process.exit(1);
  }

  const c = await mysql.createConnection(DB);
  const placeholders = medicineIds.map(() => '?').join(',');
  const [r] = await c.query(
    `DELETE FROM product_suppliers WHERE product_id NOT IN (${placeholders})`,
    medicineIds,
  );
  console.log(`Removed ${r.affectedRows} stale product_supplier mapping(s).`);

  const [remaining] = await c.query(
    'SELECT product_id, supplier_id, reorder_quantity FROM product_suppliers ORDER BY product_id',
  );
  console.log('Remaining mappings:', JSON.stringify(remaining));

  await c.end();
})().catch((e) => {
  console.error('ERR', e.message);
  process.exit(1);
});
