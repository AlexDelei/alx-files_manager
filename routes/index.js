const express = require('express');
const AppController = require('../controllers/AppController');

const app = express();

app.get('/status', (req, res) => {
  AppController.getStatus(req, res);
});

app.get('/stats', (req, res) => {
  AppController.getStats(req, res);
});

module.exports = app;
