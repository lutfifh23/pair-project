'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Investments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.TEXT
      },
      CompanyId: {
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: 'Companies'
          },
          key: "id"
        }
      },
      AccountId: {
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: 'Accounts'
          },
          key: "id"
        }
      },
      InvestmentType: {
        type: Sequelize.STRING
      },
      amount: {
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Investments');
  }
};