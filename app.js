const express = require('express');
const app = express();

const mongoose = require('mongoose');
const morgan = require('morgan');
const config = require('config');
const database = require('./model/database');
const EntityIdIndexerModel = require('./model/EntityIdIndexer');
const EntityIdIndexer = require('./services/entityIdIndexer')

const defaultPort = config.get('port');
const port = process.env.PORT || defaultPort;

const morganFormat = config.get('morganFormat');
app.use(morgan(morganFormat));

app.get('/', async (req, res, next) => {
    res.status(200).send('Hello world!');
});

const connectDatabase = () => {
    mongoose.connection.on('error', error => database.handlePeriConnectionError(error));
    database.connect();
}
connectDatabase();
EntityIdIndexer.setupEntityIdIndexer();

app.listen(port, () => {
    console.log('[info] Listening in port ' + port + '...');
});