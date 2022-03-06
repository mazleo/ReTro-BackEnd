
const EntityIdIndexerModel = require('../model/EntityIdIndexer');

const getEntityIdIndexer = async () => {
    return (await EntityIdIndexerModel.find({}).exec())[0];
};

module.exports = getEntityIdIndexer;