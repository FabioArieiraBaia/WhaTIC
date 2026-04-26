const { Sequelize } = require('sequelize');
const path = require('path');

const config = require('./backend/dist/config/database');

const sequelize = new Sequelize(config);

async function checkCampaign() {
    try {
        const [results] = await sequelize.query('SELECT id, name, status, "scheduledAt", "companyId" FROM "Campaigns" WHERE status = \'PROGRAMADA\'');
        console.log('Programmed Campaigns:', results);
        
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

checkCampaign();
