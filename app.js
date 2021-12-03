const express = require('express');
const app = express();

const mongoose = require('mongoose');
const morgan = require('morgan');
const config = require('config');
const database = require('./model/database');
const EntityIdIndexerModel = require('./model/EntityIdIndexer');
const EntityIdIndexer = require('./middleware/entityIdIndexer')

const defaultPort = config.get('port');
const port = process.env.PORT || defaultPort;

const morganFormat = config.get('morganFormat');
app.use(morgan(morganFormat));

const connectDatabase = () => {
    mongoose.connection.on('error', error => database.handlePeriConnectionError(error));
    database.connect();
}
connectDatabase();

EntityIdIndexer.setupEntityIdIndexer();
app.use(EntityIdIndexer.setupEntityIdIndexer);

app.listen(port, () => {
    console.log('[info] Listening in port ' + port + '...');
});