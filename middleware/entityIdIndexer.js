
const EntityIdIndexerModel = require('../model/EntityIdIndexer');

const getEntityIdIndexer = async () => {
    return (await EntityIdIndexerModel.findOne({}).exec());
};

const incrementEntityIdIndexer = async (indexerName) => {
    const entityIdIndexer = await getEntityIdIndexer();

    entityIdIndexer[indexerName]++;

    await EntityIdIndexerModel.updateOne({}, entityIdIndexer).exec();
};

module.exports.getEntityIdIndexer = getEntityIdIndexer;
module.exports.incrementEntityIdIndexer = incrementEntityIdIndexer;