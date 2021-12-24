const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

router.post('/', authMiddleware.generateToken);

module.exports = router;