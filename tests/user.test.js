const express = require('express');
const config = require('config');
const supertest = require('supertest');
const request = supertest(config.get('supertestUri'));
const database = require('../model/database');
const UserModel = require('../model/User');

const resetUserDatabase = async () => {
    return UserModel.deleteMany({}).exec();
}

beforeAll(async () => {
    try {
        await database.connect();
    }
    catch (error) {
        console.error(error);
    }
});

beforeEach(async () => {
    try {
        await resetUserDatabase();
    }
    catch (error) {
        console.error(error);
    }
});

test('POST /user', done => {
    try {
        // Correct inputs
        request
            .post('/user')
            .send({email:'email1@example.com', password:'password'})
            .set('Accept', 'application/json')
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(200, {email:'email1@example.com'})
            .end(done);
        // Conflict inputs
        request
            .post('/user')
            .send({email:'email1@example.com', password:'password'})
            .set('Accept', 'application/json')
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(200)
            .end(done);
        // Invalid email
        request
            .post('/user')
            .send({email:'email1example.com', password:'password'})
            .set('Accept', 'application/json')
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(400)
            .end(done);
        // Invalid password; below minimum
        request
            .post('/user')
            .send({email:'user1@example.com', password:'a'})
            .set('Accept', 'application/json')
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(400)
            .end(done);
        // Invalid password; above maximum
        request
            .post('/user')
            .send({email:'user2@example.com', password:'sdjfasd jfklajscklasjdmcilas jmcojajsodfjasdolf jasofj asofj JSLFK NSIjfosdnmf CLSDIjfo'})
            .set('Accept', 'application/json')
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(400)
            .end(done);
        // Valid password with special characters, valid email
        request
            .post('/user')
            .send({email:'user3@example.com', password:'!@#$%^&*() {}=-<>/?:;123'})
            .set('Accept', 'application/json')
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(200, {email:'user3@example.com'})
            .end(done);
        // Valid password, valid email with dot
        request
            .post('/user')
            .send({email:'user.4@example.com', password:'password'})
            .set('Accept', 'application/json')
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(200, {email:'user.4@example.com'})
            .end(done);
        // 100 valid sign ups
        for (var u = 0; u < 100; u++) {
            var testEmail = `test.email.${u}@example.com`;
            request
                .post('/user')
                .send({email:testEmail, password:'password'})
                .set('Accept', 'application/json')
                .expect('Content-Type', 'application/json; charset=utf-8')
                .expect(200, {email:testEmail})
                .end(done);
        }
    }
    catch (error) {
        console.error(error);
    }
}, (30 * 1000));

test('GET /user', done => {
    // Create samples
    request
        .post('/user')
        .send({email:'get.user.test.1@email.com',password:'password'})
        .end(done);
    request
        .post('/user')
        .send({email:'get.user.test.2@email.com',password:'password'})
        .end(done);
    request
        .post('/user')
        .send({email:'get.user.test.3@email.com',password:'password'})
        .end(done);

    // Test retrieval of samples
    request
        .get('/user')
        .send({email:'get.user.test.1@email.com'})
        .set('Accept', 'application/json')
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(200)
        .end(done);
    request
        .get('/user')
        .send({email:'get.user.test.2@email.com'})
        .set('Accept', 'application/json')
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(200)
        .end(done);
    request
        .get('/user')
        .send({email:'get.user.test.3@email.com'})
        .set('Accept', 'application/json')
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(200)
        .end(done);
});

afterAll(async () => {
    try {
        await resetUserDatabase();
        await database.close();
    }
    catch (error) {
        console.error(error);
    }
});