
const EntityIdIndexerModel = require('../model/EntityIdIndexer');
const EntityIdIndexer = require('../services/entityIdIndexer');
const database = require('../model/database')

const resetIndexer = async () => {
    await EntityIdIndexerModel.remove({}).exec();

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

    await EntityIdIndexerModel.create(indexer);
}

beforeAll(async () => {
    await database.connect();
});

beforeEach(async () => {
    resetIndexer();
});

afterAll(async () => {
    await database.close();
});
