const { DataTypes } = require("sequelize");

module.exports = {
  up: (queryInterface) => {
    return queryInterface.addColumn("ServiceOrders", "value", {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    });
  },

  down: (queryInterface) => {
    return queryInterface.removeColumn("ServiceOrders", "value");
  }
};
