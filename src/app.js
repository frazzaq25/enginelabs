require('dotenv').config();
require('express-async-errors');

const express = require('express');
const { errors } = require('celebrate');

const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const auditLogger = require('./middleware/auditLogger');
const userContext = require('./middleware/userContext');

const app = express();

app.use(express.json({ limit: '1mb' }));
app.use(userContext);
app.use(auditLogger);
app.use('/api', routes);
app.use(errors());
app.use(errorHandler);

module.exports = app;
