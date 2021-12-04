
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
    await resetIndexer();
});

test('indexer exists in database', async () => {
    const isIndexerExists = await EntityIdIndexer.checkIndexerExists();
    expect(isIndexerExists).toBeTruthy();
});

test('getIndexer retrieves indexer', async () => {
    const indexer = await EntityIdIndexer.getIndexer();

    for (var expectedIndexKey of indexerExpectedKeys) {
        var actualIndexValue = indexer[expectedIndexKey];
        expect(actualIndexValue).toBeDefined();
    }
});

test('getIndex gets indexes', async () => {
    for (var expectedKey of indexerExpectedKeys) {
        var index = await EntityIdIndexer.getIndex(expectedKey);
        expect(index).toEqual(0);
    }
});

afterEach(async () => {
    await resetIndexer();
});

afterAll(async () => {
    await database.close();
});
