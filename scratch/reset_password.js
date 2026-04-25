const { Client } = require('pg');
const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'ticketz',
  port: 5432,
});
client.connect();
client.query("UPDATE \"Users\" SET \"passwordHash\" = '$2a$08$023bak3chNX2s.plvkWl/urDq05wYUxWlrwxEPpUwTlT3oHViqvUu' WHERE email = 'admin@ticketz.host'", (err, res) => {
  if (err) {
    console.error(err);
  } else {
    console.log("Password updated successfully");
  }
  client.end();
});
