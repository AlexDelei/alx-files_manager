import AppController from '../controllers/AppController';
const express = require('express');

const app = express();
app.use(express.json());

app.get('/status', (req, res) => {
  AppController.getStatus(req, res);
});

app.get('/stats', (req, res) => {
  AppController.getStats(req, res);
});

module.exports = app;
