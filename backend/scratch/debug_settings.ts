import Setting from "../src/models/Setting";
import sequelize from "../src/database";

(async () => {
    try {
        await sequelize.authenticate();
        const settings = await Setting.findAll({
            where: {
                key: ['geminiApiKey', 'aiAgentModel']
            }
        });
        console.log("=== SETTINGS DEBUG ===");
        settings.forEach(s => {
            const val = s.value;
            const obfuscated = val.length > 8 ? val.substring(0, 4) + "..." + val.slice(-4) : val;
            console.log(`Key: ${s.key}, CompanyId: ${s.companyId}, Value: ${obfuscated}`);
        });
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();
