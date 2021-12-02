const express = require('express');
const app = express();

const morgan = require('morgan');
const config = require('config');

const defaultPort = config.get('port');
const port = process.env.PORT || defaultPort;

const morganFormat = config.get('morganFormat');
app.use(morgan(morganFormat));

app.listen(port, () => {
    console.log('[info] Listening in port ' + port + '...');
});