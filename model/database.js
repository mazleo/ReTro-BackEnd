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
        console.log('[error] Unable to initiate connection to database.');
        console.log(initialConnectionError.message);
    }
};

const handlePeriConnectionError = (error) => {
    console.log('[error] A connection error has occurred.');
    console.log(error);
}

module.exports.connect = connect;
module.exports.handlePeriConnectionError = handlePeriConnectionError;