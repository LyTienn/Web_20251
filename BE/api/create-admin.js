import UserModel from "./models/user-model.js";
import sequelize from "./config/db-config.js";

const createAdmin = async () => {
    try {
        await sequelize.authenticate();
        console.log("Database connected.");

        // Check if admin exists
        const existingAdmin = await UserModel.findByEmail('admin@gmail.com');
        if (existingAdmin) {
            console.log("Admin already exists. Updating password and role...");
            await UserModel.updatePassword(existingAdmin.user_id, 'admin');

            // Ensure role is ADMIN
            const user = await UserModel.findById(existingAdmin.user_id);
            if (user.role !== 'ADMIN') {
                // Need direct update because UserModel.update doesn't expose role update easily in safe method
                // But we can use sequelize model directly
                const User = sequelize.models.User;
                await User.update({ role: 'ADMIN' }, { where: { user_id: existingAdmin.user_id } });
                console.log("User role promoted to ADMIN");
            }

            console.log("Admin password updated to 'admin'");
        } else {
            console.log("Creating admin user...");
            await UserModel.create({
                email: 'admin@gmail.com',
                password: 'admin',
                fullName: 'System Admin',
                role: 'ADMIN'
            });
            console.log("Admin created successfully.");
        }
    } catch (error) {
        console.error("Error creating admin:", error);
    } finally {
        await sequelize.close();
    }
};

createAdmin();
