const mongoose = require('mongoose');
const config = require('config');

const connect = async () => {
    try {
        const mongoDBUri = config.get('mongoDBUri');
        await mongoose.connect(mongoDBUri, {
            autoIndex: false
        });
        console.log('[info] Connected to database.')
    }
    catch (initialConnectionError) {
        console.error('[error] Unable to initiate connection to database.');
        console.error(initialConnectionError.message);
    }
};

const handlePeriConnectionError = (error) => {
    console.log('[error] A connection error has occurred.');
    console.log(error);
}

const close = async () => {
    console.log('[info] Closing connection to database...')
    try {
        await mongoose.connection.close();
    }
    catch (error) {
        console.error(error);
    }
}

module.exports.connect = connect;
module.exports.handlePeriConnectionError = handlePeriConnectionError;
module.exports.close = close;