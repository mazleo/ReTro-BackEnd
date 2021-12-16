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
    try {
        const isIndexerExists = await checkIndexerExists();

        if (!isIndexerExists || !index) {
            throw '[error] No Entity ID Indexer exists.'
        }
    }
    catch (error) {
        console.error(error);
    }
}

const getIndexer = async () => {
    throwErrorIfNoIndexer();

    try {
        return (await EntityIdIndexerModel.find({}).exec())[0];
    }
    catch (error) {
        console.log(error);
    }
}

const getIndex = async (index) => {
    throwErrorIfNoIndexer(index);

    try {
        const indexer = await getIndexer();
        const indexValue = Number(indexer[index]);

        return indexValue;
    }
    catch (error) {
        console.log(error);
    }
}

const incrementIndex = async (index) => {
    throwErrorIfNoIndexer(index);

    try {
        let indexer = await getIndexer();
        let currentIndexValue = Number(indexer[index]);
        currentIndexValue++;
        indexer[index] = currentIndexValue;

        const indexerId = indexer['_id'];
        await EntityIdIndexerModel.updateOne({_id: indexerId}, indexer).exec();
    }
    catch (error) {
        console.log(error);
    }
}

const setupEntityIdIndexer = async (req, res, next) => {
    try {
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
    catch (error) {
        console.log(error);
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