'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Companies', "price", { type: Sequelize.INTEGER })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Companies', "price");

  }
};
