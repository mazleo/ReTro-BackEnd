const express = require('express');
const router = express.Router();

const UserModel = require('../model/User');
const {body, validationResult} = require('express-validator');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const getUserWithEmail = async email => {
    try {
        const targetUser = await UserModel.findOne({email}).exec();
        return targetUser;
    }
    catch (error) {
        console.error(error);
    }
}

/* ~~~ POST '/' ~~~ */
const userValidators = [
    body('email', 'Please enter a valid email.').isEmail(),
    body('password', 'Password must be at least 5 characters and less than 32 characters.').isLength({min: 5, max:32})
];
router.post('/', userValidators, async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({error: errors.array()});
        return next();
    }

    try {
        const newEmail = req.body.email;
        const newPassword = req.body.password;

        const isUserExist = await getUserWithEmail(newEmail);
        if (isUserExist) {
            res.status(409).json({error:{msg:`A user with the email ${newEmail} already exists.`}})
            return next();
        }

        const passwordHash = await bcrypt.hash(newPassword, saltRounds);
        const newUser = {
            email: newEmail,
            password: passwordHash
        };

        await UserModel.create(newUser);
        res.status(200).json({email: newEmail});
    }
    catch (error) {
        console.error(error);
        res.status(500).json({error:{msg:'Unable to create new user.'}});
    }
});

/* ~~~ GET '/' ~~~ */
router.get('/', async (req, res, next) => {
    try {
        const criteria = req.body;
        const targetUsers = await UserModel.find(criteria).exec();

        res.status(200).json(targetUsers);
    }
    catch (error) {
        console.error(error);
    }
});

module.exports = router;