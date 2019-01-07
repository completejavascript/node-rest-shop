const express = require('express');

const app = express();

/**
 * Middleware
 */
app.use((req, res, next) => {
  res.status(200).json({
    message: 'It works!'
  });
});

module.exports = app;