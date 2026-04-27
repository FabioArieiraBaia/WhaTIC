
const { DataTypes } = require("sequelize");

module.exports = {
  up: (queryInterface) => {
    return Promise.all([
      queryInterface.addColumn("Products", "pixImageUrl", {
        type: DataTypes.STRING,
        allowNull: true
      }),
      queryInterface.addColumn("Products", "pixCopiaCola", {
        type: DataTypes.TEXT,
        allowNull: true
      })
    ]);
  },

  down: (queryInterface) => {
    return Promise.all([
      queryInterface.removeColumn("Products", "pixImageUrl"),
      queryInterface.removeColumn("Products", "pixCopiaCola")
    ]);
  }
};
