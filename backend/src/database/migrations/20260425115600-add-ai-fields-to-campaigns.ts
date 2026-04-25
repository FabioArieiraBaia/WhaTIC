import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.addColumn("Campaigns", "useAi", {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      }),
      queryInterface.addColumn("Campaigns", "aiPrompt", {
        type: DataTypes.TEXT,
        allowNull: true
      })
    ]);
  },

  down: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.removeColumn("Campaigns", "useAi"),
      queryInterface.removeColumn("Campaigns", "aiPrompt")
    ]);
  }
};
