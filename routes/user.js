const express = require('express');
const router = express.Router();

const UserModel = require('../model/User');
const {body, validationResult} = require('express-validator');
const bcrypt = require('bcrypt');
const saltRounds = 10;

module.exports = router;