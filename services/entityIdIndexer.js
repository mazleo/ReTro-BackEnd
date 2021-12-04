/** 
 * entityIdIndexer.js
 * Service for working with EntityIdIndexer data
 */

const mongoose = require('mongoose');
const EntityIdIndexerModel = require('../model/EntityIdIndexer')

const checkIndexerExists = () => {
    return EntityIdIndexerModel.exists();
}

const throwErrorIfNoIndexer = async (index=true) => {
    const isIndexerExists = await checkIndexerExists();
    if (!isIndexerExists || !index) {
        throw '[error] No Entity ID Indexer exists.'
    }
}

const getIndexer = async () => {
    throwErrorIfNoIndexer();

    return (await EntityIdIndexerModel.find({}).exec())[0];
}

const getIndex = async (index) => {
    throwErrorIfNoIndexer(index);

    const indexer = await getIndexer();
    const indexValue = indexer[index];

    return indexValue;
}

const incrementIndex = async (index) => {
    throwErrorIfNoIndexer(index);

    const indexer = await getIndexer();
    indexer[index]++;

    console.log('[info] Incrementing indexer ' + index + '...');
    const indexerId = indexer['_id'];
    await EntityIdIndexerModel.updateOne({_id: indexerId}, indexer).exec();
}

const setupEntityIdIndexer = async (req, res, next) => {
    const isIndexerExists = await checkIndexerExists();

    if (!isIndexerExists) {
        const indexer = {
            userIdIndex: 0,
            retroCalendarIdIndex: 0,
            workspaceIdIndex: 0,
            projectIdIndex: 0,
            tagIdIndex: 0,
            tagCompositionIdIndex: 0,
            taskIdIndex: 0,
            timesheetIdIndex: 0,
            logIdIndex: 0
        }

        console.log('[info] No Entity ID Indexer found. Creating one...')
        await EntityIdIndexerModel.create(indexer);
    }
}

const entityIdIndexer = {
    checkIndexerExists,
    setupEntityIdIndexer,
    getIndexer,
    getIndex,
    incrementIndex,
    throwErrorIfNoIndexer,
    checkIndexerExists
}

module.exports = entityIdIndexer;