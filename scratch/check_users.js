const { Client } = require('pg');
const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'ticketz',
  port: 5432,
});
client.connect();
client.query('SELECT name, email, "passwordHash" FROM "Users"', (err, res) => {
  if (err) {
    console.error(err);
  } else {
    console.log(JSON.stringify(res.rows, null, 2));
  }
  client.end();
});
