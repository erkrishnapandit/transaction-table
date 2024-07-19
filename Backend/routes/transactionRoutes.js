const express = require('express');
const router = express.Router();
const {
  initializeDatabase,
  listTransactions,
  getStatistics,
  getBarChartData,
  getPieChartData
} = require('../controllers/transactionController');

router.get('/initialize', initializeDatabase);
router.get('/transactions', listTransactions);
router.get('/transactions/statistics', getStatistics);
router.get('/transactions/bar-chart', getBarChartData);
router.get('/transactions/pie-chart', getPieChartData);

module.exports = router;
