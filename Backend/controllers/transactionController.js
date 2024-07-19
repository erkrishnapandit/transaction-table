const axios = require('axios');
const Transaction = require('../models/Transaction');

// Initialize database with data from external API
const initializeDatabase = async (req, res) => {
  try {
    const { data } = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
    await Transaction.deleteMany({});
    await Transaction.insertMany(data);
    res.status(200).send('Database initialized successfully');
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// List transactions with pagination and search
const listTransactions = async (req, res) => {
  const { month, page = 1, search = '' } = req.query;
  const regex = new RegExp(search, 'i');
  const transactions = await Transaction.find({
    dateOfSale: { $regex: `-${month.slice(0, 3)}-`, $options: 'i' },
    $or: [{ title: regex }, { description: regex }, { price: parseFloat(search) }]
  }).skip((page - 1) * 10).limit(10);
  res.status(200).json(transactions);
};

// Get statistics
const getStatistics = async (req, res) => {
  const { month } = req.query;
  const transactions = await Transaction.find({
    dateOfSale: { $regex: `-${month.slice(0, 3)}-`, $options: 'i' }
  });
  const totalSaleAmount = transactions.reduce((sum, t) => sum + t.price, 0);
  const totalSoldItems = transactions.filter(t => t.sold).length;
  const totalNotSoldItems = transactions.filter(t => !t.sold).length;
  res.status(200).json({ totalSaleAmount, totalSoldItems, totalNotSoldItems });
};

// Get bar chart data
const getBarChartData = async (req, res) => {
  const { month } = req.query;
  const transactions = await Transaction.find({
    dateOfSale: { $regex: `-${month.slice(0, 3)}-`, $options: 'i' }
  });
  const priceRanges = [0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000];
  const barChartData = {};
  priceRanges.forEach((range, index) => {
    const min = range;
    const max = priceRanges[index + 1] || Infinity;
    const count = transactions.filter(t => t.price >= min && t.price < max).length;
    barChartData[`${min}-${max}`] = count;
  });
  res.status(200).json(barChartData);
};

// Get pie chart data
const getPieChartData = async (req, res) => {
  const { month } = req.query;
  const transactions = await Transaction.find({
    dateOfSale: { $regex: `-${month.slice(0, 3)}-`, $options: 'i' }
  });
  const categoryCounts = transactions.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + 1;
    return acc;
  }, {});
  res.status(200).json(categoryCounts);
};

module.exports = {
  initializeDatabase,
  listTransactions,
  getStatistics,
  getBarChartData,
  getPieChartData
};
