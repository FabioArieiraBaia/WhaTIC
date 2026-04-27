
const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');
dotenv.config({ path: './.env' });

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: 'postgres',
  logging: console.log
});

async function test() {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
    const [results] = await sequelize.query('SELECT 1+1 AS result');
    console.log('Query result:', results);
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  } finally {
    await sequelize.close();
  }
}

test();
