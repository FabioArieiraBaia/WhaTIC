const { DataTypes } = require("sequelize");

module.exports = {
  up: (queryInterface) => {
    return Promise.all([
      queryInterface.addColumn("Products", "testimonialAudioUrl", {
        type: DataTypes.STRING,
        allowNull: true
      }),
      queryInterface.addColumn("Products", "testimonialImageUrl", {
        type: DataTypes.STRING,
        allowNull: true
      })
    ]);
  },

  down: (queryInterface) => {
    return Promise.all([
      queryInterface.removeColumn("Products", "testimonialAudioUrl"),
      queryInterface.removeColumn("Products", "testimonialImageUrl")
    ]);
  }
};
