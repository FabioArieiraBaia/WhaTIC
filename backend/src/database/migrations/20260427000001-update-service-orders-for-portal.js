
const { DataTypes } = require("sequelize");

module.exports = {
  up: (queryInterface) => {
    return Promise.all([
      queryInterface.addColumn("ServiceOrders", "videoUrl", {
        type: DataTypes.STRING,
        allowNull: true
      }),
      queryInterface.sequelize.query('ALTER TYPE "enum_ServiceOrders_status" ADD VALUE IF NOT EXISTS \'AGUARDANDO_PAGAMENTO\''),
      queryInterface.sequelize.query('ALTER TYPE "enum_ServiceOrders_status" ADD VALUE IF NOT EXISTS \'PAGO\''),
      queryInterface.sequelize.query('ALTER TYPE "enum_ServiceOrders_status" ADD VALUE IF NOT EXISTS \'ENTREGUE\'')
    ]);
  },

  down: (queryInterface) => {
    return Promise.all([
      queryInterface.removeColumn("ServiceOrders", "videoUrl")
    ]);
  }
};
