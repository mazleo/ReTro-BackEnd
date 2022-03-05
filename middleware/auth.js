const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserModel = require('../model/User');
const config = require('config');

const loginError = {
    error: [
        {
            msg: 'Invalid credentials.'
        }
    ]
};

const validationError = {
    error: [
        {
            msg: 'Unauthorized.'
        }
    ]
}

const generateToken = async (req, res, next) => {
    try {
        const emailInput = req.body.email;
        const passwordInput = req.body.password;

        const targetUser = await UserModel.findOne({email:emailInput}).exec();
        if (!targetUser) {
            res.status(401).json(loginError);
            return;
        }

        const targetPasswordHash = targetUser.password;
        const isPasswordMatch = await bcrypt.compare(passwordInput, targetPasswordHash);
        if (!isPasswordMatch) {
            res.status(401).json(loginError);
            return;
        }

        const token = await jwt.sign(
            {email:emailInput},
            config.get('jwts'),
            {expiresIn: config.get('expire')}
        );

        res.status(200).json({token: token});
        return;
    }
    catch (error) {
        console.error(error);
    }
};

const validateToken = async (req, res, next) => {
    const authHeader = req.get('Authorization');
    if (!authHeader) {
        res.status(401).json(validationError);
        return;
    }

    const token = authHeader.split(' ')[1];

    try {
        const email = await jwt.verify(token, config.get('jwts')).email;

        const targetUser = await UserModel.findOne({email}).exec();
        if (!targetUser) {
            res.status(401).json(validationError);
            return;
        }

        return next();
    }
    catch (tokenError) {
        res.status(401).json(validationError);
        return;
    }
};

module.exports.generateToken = generateToken;
module.exports.validateToken = validateToken;