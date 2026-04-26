const { Sequelize } = require('sequelize');
const path = require('path');

const config = require('./backend/dist/config/database');

const sequelize = new Sequelize(config);

async function checkCampaignSetting() {
    try {
        const [results] = await sequelize.query('SELECT * FROM "Settings" WHERE key = \'campaignsEnabled\'');
        console.log('Campaign Settings:', results);
        
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

checkCampaignSetting();
