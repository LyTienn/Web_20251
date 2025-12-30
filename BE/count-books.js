
const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    logging: false
});

async function countBooks() {
    try {
        await sequelize.authenticate();
        const [results] = await sequelize.query("SELECT COUNT(*) FROM books");
        console.log(`Total books in DB: ${results[0].count}`);

        const [recent] = await sequelize.query("SELECT title FROM books ORDER BY id DESC LIMIT 5");
        console.log("Most recent 5 books (sequentially):");
        recent.forEach(r => console.log("- " + r.title));
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    } finally {
        await sequelize.close();
    }
}

countBooks();
