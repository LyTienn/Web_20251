
import SystemSettings from "./models/system-settings-model.js";
import sequelize from "./config/db-config.js";

async function sync() {
    try {
        await sequelize.authenticate();
        console.log("Connected.");
        await SystemSettings.sync({ alter: true });
        console.log("SystemSettings synced.");
        process.exit(0);
    } catch (e) {
        console.error("Sync failed:", e);
        process.exit(1);
    }
}
sync();
