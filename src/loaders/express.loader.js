const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const routes = require('../routes');
const { errorMiddleware } = require('../middlewares');

const loadExpress = async (app) => {
  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use('/api', routes);

  app.use(errorMiddleware);
};

module.exports = loadExpress;