'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Profiles', "AccountId", { type: Sequelize.INTEGER, references: { model: "Accounts", key: "id" } });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Profiles', "AccountId");
  }
};
