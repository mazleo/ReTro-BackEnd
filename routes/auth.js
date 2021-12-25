const express = require('express');
const router = express.Router();
const { generateToken, validateToken } = require('../middleware/auth');

router.post('/', generateToken);

module.exports = router;