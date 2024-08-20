'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const companies = require('../MOCK_DATA_1.json').map(el => {
      delete el.id
      el.createdAt = new Date()
      el.updatedAt = new Date()
      return el
    })
    await queryInterface.bulkInsert('Companies', companies)
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Companies', null, { truncate: true, restartIdentity: true, cascade: true });

  }
};
