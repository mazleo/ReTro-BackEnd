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
            {emailInput},
            config.get('secret'),
            {expiresIn: config.get('expire')}
        );

        res.status(200).json({token: token});
    }
    catch (error) {
        console.error(error);
    }
};

module.exports.generateToken = generateToken;
// module.exports.validateToken = 