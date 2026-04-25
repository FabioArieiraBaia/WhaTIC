import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.addColumn("Products", "videoUrl", {
        type: DataTypes.STRING,
        allowNull: true
      }),
      queryInterface.addColumn("Products", "testimonials", {
        type: DataTypes.TEXT,
        allowNull: true
      }),
      queryInterface.addColumn("Products", "relatedProducts", {
        type: DataTypes.TEXT,
        allowNull: true
      })
    ]);
  },

  down: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.removeColumn("Products", "videoUrl"),
      queryInterface.removeColumn("Products", "testimonials"),
      queryInterface.removeColumn("Products", "relatedProducts")
    ]);
  }
};
