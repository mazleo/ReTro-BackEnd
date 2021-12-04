
const EntityIdIndexerModel = require('../model/EntityIdIndexer');
const EntityIdIndexer = require('../services/entityIdIndexer');
const database = require('../model/database')
const indexerExpectedKeys = [
    'userIdIndex',
    'retroCalendarIdIndex',
    'workspaceIdIndex',
    'projectIdIndex',
    'tagIdIndex',
    'tagCompositionIdIndex',
    'taskIdIndex',
    'timesheetIdIndex',
    'logIdIndex'
];

const resetIndexer = async () => {
    await EntityIdIndexerModel.deleteMany({}).exec();

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

test('indexer exists in database', async () => {
    const indexer = (await EntityIdIndexerModel.find({}).exec())[0];
    expect(indexer).toBeTruthy();
});

test('getIndexer retrieves indexer', async () => {
    const indexer = (await EntityIdIndexerModel.find({}).exec())[0];

    for (var expectedIndexKey of indexerExpectedKeys) {
        var actualIndexValue = indexer[expectedIndexKey];
        expect(actualIndexValue).toBeDefined();
    }
});

afterEach(async () => {
    await resetIndexer();
});

afterAll(async () => {
    await database.close();
});
