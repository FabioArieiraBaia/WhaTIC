const { Client } = require('pg');
const c = new Client({
  host: '34.61.204.112',
  port: 5432,
  user: 'postgres',
  password: 'Whatic_password_123@',
  database: 'whatic',
  ssl: { rejectUnauthorized: false }
});

c.connect()
  .then(() => c.query(`UPDATE "ServiceOrders" SET "productId" = 1 WHERE id = 15 AND "productId" IS NULL RETURNING id, "productId", status`))
  .then(r => {
    console.log("UPDATED:", JSON.stringify(r.rows, null, 2));
    c.end();
  })
  .catch(e => {
    console.error(e.message);
    c.end();
  });
