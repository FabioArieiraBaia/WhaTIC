
import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.addColumn("ServiceOrders", "videoUrl", {
        type: DataTypes.STRING,
        allowNull: true
      }),
      // For PostgreSQL, adding values to ENUM requires special SQL
      queryInterface.sequelize.query('ALTER TYPE "enum_ServiceOrders_status" ADD VALUE IF NOT EXISTS \'AGUARDANDO_PAGAMENTO\''),
      queryInterface.sequelize.query('ALTER TYPE "enum_ServiceOrders_status" ADD VALUE IF NOT EXISTS \'PAGO\''),
      queryInterface.sequelize.query('ALTER TYPE "enum_ServiceOrders_status" ADD VALUE IF NOT EXISTS \'ENTREGUE\'')
    ]);
  },

  down: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.removeColumn("ServiceOrders", "videoUrl")
      // Note: Removing values from ENUM is not supported in PostgreSQL ALTER TYPE
    ]);
  }
};
