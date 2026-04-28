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
  .then(() => c.query(`SELECT so.id, so.status, so."productId", so."contactId", p.name, p."pixImageUrl", p."pixCopiaCola" FROM "ServiceOrders" so LEFT JOIN "Products" p ON so."productId" = p.id WHERE so.id = 15`))
  .then(r => {
    console.log("SERVICE ORDER #15:");
    console.log(JSON.stringify(r.rows, null, 2));
    c.end();
  })
  .catch(e => {
    console.error(e.message);
    c.end();
  });
