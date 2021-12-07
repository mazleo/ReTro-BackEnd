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


afterAll(async () => {
    try {
        await resetUserDatabase();
        await database.close();
    }
    catch (error) {
        console.error(error);
    }
});