import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import routes from '../routes/index.js';
import {errorMiddleware } from '../middlewares/index.js';

const loadExpress = async (app) => {
  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use('/api', routes);

  app.use(errorMiddleware);
};

export default loadExpress;
