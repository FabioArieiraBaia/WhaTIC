const { Sequelize } = require('sequelize');
const path = require('path');

const config = require('./backend/dist/config/database');

const sequelize = new Sequelize(config);

async function checkTranslations() {
    try {
        const [results] = await sequelize.query('SELECT language, COUNT(*) FROM "Translations" GROUP BY language');
        console.log('Translations grouped by language:');
        console.log(results);
        
        const [nullLangs] = await sequelize.query('SELECT COUNT(*) FROM "Translations" WHERE language IS NULL');
        console.log('Translations with NULL language:', nullLangs);
        
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

checkTranslations();
