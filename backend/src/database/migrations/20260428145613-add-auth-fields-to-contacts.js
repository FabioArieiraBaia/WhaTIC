'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable('Contacts');
    
    const additions = [];
    
    if (!tableInfo.passwordHash) {
      additions.push(queryInterface.addColumn('Contacts', 'passwordHash', {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null
      }));
    }
    
    if (!tableInfo.tokenVersion) {
      additions.push(queryInterface.addColumn('Contacts', 'tokenVersion', {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      }));
    }
    
    if (!tableInfo.isVerified) {
      additions.push(queryInterface.addColumn('Contacts', 'isVerified', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      }));
    }

    return Promise.all(additions);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('Contacts', 'passwordHash'),
      queryInterface.removeColumn('Contacts', 'tokenVersion'),
      queryInterface.removeColumn('Contacts', 'isVerified')
    ]);
  }
};
