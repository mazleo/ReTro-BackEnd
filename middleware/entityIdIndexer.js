
const EntityIdIndexerModel = require('../model/EntityIdIndexer');

const getEntityIdIndexer = async () => {
    return (await EntityIdIndexerModel.findOne({}).exec());
};

module.exports = getEntityIdIndexer;