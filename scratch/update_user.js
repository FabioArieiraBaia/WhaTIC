const { Client } = require('pg');
const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'ticketz',
  port: 5432,
});
client.connect();
client.query("UPDATE \"Users\" SET email = 'admin@ticketz.host' WHERE email = 'admin@fabio.com'", (err, res) => {
  if (err) {
    console.error(err);
  } else {
    console.log("User updated successfully");
  }
  client.end();
});
