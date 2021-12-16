
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
    try {
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
    catch (error) {
        console.error(error);
    }
}

beforeAll(async () => {
    try {
        await database.connect();
    }
    catch (error) {
        console.log(error);
    }
});

beforeEach(async () => {
    try {
        await resetIndexer();
    }
    catch (error) {
        console.error(error);
    }
});

test('indexer exists in database', async () => {
    try {
        const isIndexerExists = await EntityIdIndexer.checkIndexerExists();
        expect(isIndexerExists).toBeTruthy();
    }
    catch (error) {
        console.error(error);
    }
});

test('getIndexer retrieves indexer', async () => {
    try {
        const indexer = await EntityIdIndexer.getIndexer();

        for (var expectedIndexKey of indexerExpectedKeys) {
            var actualIndexValue = indexer[expectedIndexKey];
            expect(actualIndexValue).toBeDefined();
        }
    }
    catch (error) {
        console.error(error);
    }
});

test('getIndex gets indexes', async () => {
    try {
        for (var expectedKey of indexerExpectedKeys) {
            var index = await EntityIdIndexer.getIndex(expectedKey);
            expect(index).toEqual(0);
        }
    }
    catch (error) {
        console.error(error);
    }
});

test('incrementIndex properly increments an index', async () => {
    try {
        const maxNumOfRepetitions = 100;

        for (var expectedKey of indexerExpectedKeys) {
            var randomNumOfRepetitions = Math.floor(Math.random() * maxNumOfRepetitions);

            for (var i = 0; i < randomNumOfRepetitions; i++) {
                await EntityIdIndexer.incrementIndex(expectedKey);
                var actualValue = await EntityIdIndexer.getIndex(expectedKey);
                var expectedValue = i + 1;
                expect(actualValue).toEqual(expectedValue);
            }
        }
    }
    catch (error) {
        console.error(error);
    }
}, timeout=60000);

afterEach(async () => {
    try {
        await resetIndexer();
    }
    catch (error) {
        console.error(error);
    }
});

afterAll(async () => {
    try {
        await database.close();
    }
    catch (error) {
        console.error(error);
    }
});
