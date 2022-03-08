const express = require('express');
const app = express();

const mongoose = require('mongoose');
const morgan = require('morgan');
const config = require('config');
const database = require('./model/database');
const EntityIdIndexerModel = require('./model/EntityIdIndexer');
const EntityIdIndexer = require('./services/entityIdIndexer')
const { validateToken } = require('./middleware/auth');

const defaultPort = config.get('port');
const port = process.env.PORT || defaultPort;

const morganFormat = config.get('morganFormat');
app.use(morgan(morganFormat));

app.use(express.json());
app.use((req, res, next) => {
    req.accepts('application/json');
    res.type('application/json');
    return next();
});

app.get('/', async (req, res, next) => {
    res.status(200).send('Hello world!');
});

const userRouter = require('./routes/user');
app.use('/user', userRouter);

const authRouter = require('./routes/auth');
app.use('/auth', authRouter);

const workspaceRouter = require('./routes/workspace');
app.use('/workspace', validateToken, workspaceRouter);

const connectDatabase = () => {
    mongoose.connection.on('error', error => database.handlePeriConnectionError(error));
    database.connect();
}
connectDatabase();
EntityIdIndexer.setupEntityIdIndexer();

app.listen(port, () => {
    console.log('[info] Listening in port ' + port + '...');
});