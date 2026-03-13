const { Sequelize } = require('sequelize');

/**
 * Sequelize instance connected to the MySQL database.
 * Credentials are loaded from environment variables defined in `.env`.
 *
 * When NODE_ENV === 'test', the database name is suffixed with `_test`
 * so that test suites never touch the development / production database.
 */
const isTest = process.env.NODE_ENV === 'test';
const dbName = isTest
    ? `${process.env.DB_NAME}_test`
    : process.env.DB_NAME;

const sequelize = new Sequelize(
    dbName,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        dialect: 'mysql',
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        pool: {
            max: 10,
            min: 0,
            acquire: 30000,
            idle: 10000,
        },
    }
);

module.exports = sequelize;
