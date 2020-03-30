const Sequelize = require("sequelize");

const connection = new Sequelize('guiapress','root', '12345678', {
    host: 'localhost',
    dialect: 'mysql',
    timezone: "-05:00"
});

module.exports = connection;