const express = require('express');
const router = express.Router();
const { generateToken } = require('../middleware/auth');

router.post('/', generateToken);

module.exports = router;