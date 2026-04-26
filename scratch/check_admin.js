const { Sequelize } = require('sequelize');
const path = require('path');

const config = require('./backend/dist/config/database');

const sequelize = new Sequelize(config);

async function checkAdmin() {
    try {
        const [results] = await sequelize.query('SELECT name, "companyId", profile FROM "Users" WHERE email = \'admin@ticketz.host\'');
        console.log('Admin User:', results);
        
        if (results.length > 0) {
            const companyId = results[0].companyId;
            const [companies] = await sequelize.query(`SELECT id, name FROM "Companies" WHERE id = ${companyId}`);
            console.log('Company:', companies);
        }
        
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

checkAdmin();
