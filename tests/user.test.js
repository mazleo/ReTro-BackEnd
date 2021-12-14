const express = require('express');
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

const wait = waitMS => {
    const beginTimeMS = Date.now();
    let currentTimeMS = beginTimeMS;
    while (currentTimeMS - beginTimeMS < waitMS) {
        currentTimeMS = Date.now();
    }
};

beforeAll(async () => {
    try {
        await database.connect();
        await resetUserDatabase();
        await resetIndexer();
    }
    catch (error) {
        console.error(error);
    }
});

test('POST /user valid input', done => {
    try {
        request
            .post('/user')
            .send({email:'email1@example.com', password:'password'})
            .set('Accept', 'application/json')
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(201)
            .end(done);
    }
    catch (error) {
        console.error(error);
    }
}, (60 * 1000));

test('POST /user with conflict input', done => {
    try {
        request
            .post('/user')
            .send({email:'email1@example.com', password:'password'})
            .set('Accept', 'application/json')
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(409, {error:{msg:"A user with the email email1@example.com already exists."}})
            .end(done);
    }
    catch (error) {
        console.error(error);
    }
});

test('POST /user with invalid email', done => {
    try {
        request
            .post('/user')
            .send({email:'email1example.com', password:'password'})
            .set('Accept', 'application/json')
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(400)
            .end(done);
    }
    catch (error) {
        console.log(error);
    }
});

test('POST /user with invalid password; below minimum length', done => {
    try {
        request
            .post('/user')
            .send({email:'user1@example.com', password:'a'})
            .set('Accept', 'application/json')
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(400)
            .end(done);
    }
    catch (error) {
        console.log(error);
    }
});

test('POST /user with invalid password; above minimum length', done => {
    try {
        request
            .post('/user')
            .send({email:'user2@example.com', password:'sdjfasd jfklajscklasjdmcilas jmcojajsodfjasdolf jasofj asofj JSLFK NSIjfosdnmf CLSDIjfo'})
            .set('Accept', 'application/json')
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(400)
            .end(done);
    }
    catch (error) {
        console.log(error);
    }
});

test('POST /user with valid input; password with special characters', done => {
    try {
        request
            .post('/user')
            .send({email:'user3@example.com', password:'!@#$%^&*() {}=-<>/?:;123'})
            .set('Accept', 'application/json')
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(201)
            .end(done);
    }
    catch (error) {
        console.log(error);
    }
});

test('POST /user with valid inputs; email with dot', done => {
    try {
        request
            .post('/user')
            .send({email:'user.4@example.com', password:'password'})
            .set('Accept', 'application/json')
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(201)
            .end(done);
    }
    catch (error) {
        console.log(error);
    }
});

test('GET /user', done => {
    // Create sample
    request
        .post('/user')
        .send({email:'get.user.test.1@email.com',password:'password'})
        .end(done);
    // Test retrieval of sample
    request
        .get('/user')
        .send({email:'get.user.test.1@email.com'})
        .set('Accept', 'application/json')
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(200)
        .end(done);
});

describe('Get specific user', () => {
    beforeAll(async () => {
        try {
            await resetIndexer();
            await resetUserDatabase();
        }
        catch (error) {
            console.error(error);
        }
    })
    beforeEach(done => {
        // Create sample first
        request
            .post('/user')
            .send({email:'example@example.com',password:'password'})
            .end(done);
    });
    test('GET /user/:userId', done => {
        // Valid input; found resource
        // Get sample
        request
            .get('/user/1')
            .set('Accept', 'application/json')
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(200)
            .expect({email:'example@example.com',id:'1'})
            .end(done);

        // Valid input; resource not found
        request
            .get('/user/5839058')
            .set('Accept', 'application/json')
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(404)
            .end(done);

        // Invalid input; not a number
        request
            .get('/user/lsdfalsfjlaskdfjlksjdf')
            .set('Accept', 'application/json')
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(400)
            .end(done);
        // Invalid input; with special characters
        request
            .get('/user/df!@#*fjakl(#jfKI(#.')
            .set('Accept', 'application/json')
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(400)
            .end(done);
        // Invalid input; numbers with letters
        request
            .get('/user/358j39589')
            .set('Accept', 'application/json')
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(400)
            .end(done);
    });
});

describe('Update a user', () => {
    beforeAll(async () => {
        try {
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
            .send({email:'email@email.com',password:'password'})
            .end(done);
    });

    test('PUT /user/:userId - valid email', done => {
        request
            .put('/user/1')
            .send({email:'iamvalid@email.com'})
            .expect(200)
            .end(done);
    });

    test('PUT /user/:userId - valid password', done => {
        request
            .put('/user/1')
            .send({password:'iampassowrd'})
            .expect(200)
            .end(done);
    });

    test('PUT /user/:userId - valid password and email', done => {
        request
            .put('/user/1')
            .send({email:'iamgoodone@email.com',password:'iampassowrd'})
            .expect(200)
            .end(done);
    });

    test('PUT /user/:userId - invalid id', done => {
        request
            .put('/user/1a')
            .send({email:'iamgoodone@email.com',password:'iampassowrd'})
            .expect(400)
            .end(done);
    });

    test('PUT /user/:userId - invalid email', done => {
        request
            .put('/user/1')
            .send({email:'iamgoodone@com'})
            .expect(400)
            .end(done);
    });
    
    test('PUT /user/:userId - invalid password', done => {
        request
            .put('/user/1')
            .send({password:'fk'})
            .expect(400)
            .end(done);
    });

    test('PUT /user/:userId - invalid password and email', done => {
        request
            .put('/user/1')
            .send({email:'iamgoodone',password:'fkd'})
            .expect(400)
            .end(done);
    });

    test('PUT /user/:userId - valid email, invalid password', done => {
        request
            .put('/user/1')
            .send({email:'iamgoodone@email.com',password:'fkd'})
            .expect(400)
            .end(done);
    });

    test('PUT /user/:userId - invalid email, valid password', done => {
        request
            .put('/user/1')
            .send({email:'iamgoodone',password:'password'})
            .expect(400)
            .end(done);
    });
});

afterAll(async () => {
    try {
        await resetUserDatabase();
        await resetIndexer();
        await database.close();
    }
    catch (error) {
        console.error(error);
    }
});