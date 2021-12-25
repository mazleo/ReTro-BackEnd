const config = require('config');
const supertest = require('supertest');
const request = supertest(config.get('supertestUri'));
const database = require('../model/database');
const UserModel = require('../model/User');
const EntityIdIndexerModel = require('../model/EntityIdIndexer');

const resetUserDatabase = async () => {
    await UserModel.deleteMany({}).exec();
}

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
        await resetIndexer();
        await resetUserDatabase();
    }
    catch (error) {
        console.error(error);
    }
});

beforeEach(done => {
    request
        .post('/user')
        .send({email:'iamanemail@example.com',password:'I am a Password.'})
        .end(done);
});

test('POST /auth - Generate token with valid cred', done => {
    request
        .post('/auth')
        .send({email:'iamanemail@example.com',password:'I am a Password.'})
        .set('Accept', 'application/json')
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(200)
        .end(done);
});

test('POST /auth - Generate token with nonexistent email', done => {
    request
        .post('/auth')
        .send({email:'nonexistentemail@example.com',password:'asldkfj'})
        .set('Accept', 'application/json')
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(401)
        .end(done);
});

test('POST /auth - Generate token with wrong password', done => {
    request
        .post('/auth')
        .send({email:'iamanemail@example.com',password:'I am wrong password'})
        .set('Accept', 'application/json')
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(401)
        .end(done);
});

afterAll(async () => {
    try {
        await resetIndexer();
        await resetUserDatabase();
        await database.close();
    }
    catch (error) {
        console.error(error);
    }
});