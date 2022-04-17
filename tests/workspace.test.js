
const database = require('../model/database');

const config = require('config');
const supertest = require('supertest');
const request = supertest(config.get('supertestUri'));

const { stdout } = require('process');

const testUtility = require('./testUtility');
const testTimeout = 60000;

const EMAIL = 'hello.world@example.com';
const PASSWORD = 'letmein';

let responseToken = null;

const log = message => {
    console.log(`[info] ${message}`);
}

beforeAll(async () => {
    try {
        await database.connect();
        await testUtility.resetUserDatabase();
        await testUtility.resetIndexer();

        return request
            .post('/user')
            .send({email: `${EMAIL}`, password: `${PASSWORD}`})
            .set('Accept', 'application/json')
            .expect(201);
    }
    catch (err) {
        console.error(err);
    }

}, testTimeout);

describe('Test Workspace POST /', () => {
    beforeAll(done => {
        request
            .post('/auth')
            .send({email: `${EMAIL}`, password: `${PASSWORD}`})
            .set('Accept', 'application/json')
            .expect(200)
            .then(res => {
                responseToken = res.body.token;
                done();
            })
            .catch(err => done(err));
    }, testTimeout);

    test('POST / - Create a workspace for authorized logged in user.', done => {
        request
            .post('/workspace')
            .send({name: 'Test Workspace'})
            .set('Authorization', responseToken)
            .expect(201)
            .end(done);
    }, testTimeout)

    test('POST / - Create a workspace for unauthorized user.', done => {
        request
            .post('/workspace')
            .send({name: 'Test Workspace'})
            .set('Authorization', 'not a token')
            .expect(401)
            .end(done);
    }, testTimeout)

    test('POST / - Create a workspace for empty name.', done => {
        request
            .post('/workspace')
            .send({name: ''})
            .set('Authorization', responseToken)
            .expect(400)
            .end(done);
    }, testTimeout)

    test('POST / - Create a workspace for single letter', done => {
        request
            .post('/workspace')
            .send({name: 'k'})
            .set('Authorization', responseToken)
            .expect(201)
            .end(done);
    }, testTimeout)

    test('POST / - Create a workspace with non-string', done => {
        request
            .post('/workspace')
            .send({name: 2})
            .set('Authorization', responseToken)
            .expect(400)
            .end(done);
    }, testTimeout)
});

afterAll(async () => {
    await testUtility.resetUserDatabase();
    await testUtility.resetIndexer();
    await database.close();
});