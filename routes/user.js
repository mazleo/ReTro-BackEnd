const express = require('express');
const router = express.Router();

const UserModel = require('../model/User');
const EntityIdIndexer = require('../services/entityIdIndexer');
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

/* ~~~ POST '/' - Create a user ~~~ */
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

        const indexKey = 'userIdIndex';
        await EntityIdIndexer.incrementIndex(indexKey);
        const newId = Number(await EntityIdIndexer.getIndex(indexKey));
        const passwordHash = await bcrypt.hash(newPassword, saltRounds);
        const newUser = {
            id: newId,
            email: newEmail,
            password: passwordHash
        };

        await UserModel.create(newUser);
        res.status(200).json({id:newId,email:newEmail});
    }
    catch (error) {
        console.error(error);
        res.status(500).json({error:{msg:'Unable to create new user.'}});
    }
});

/* ~~~ GET '/' - Get users with criteria ~~~ */
router.get('/', async (req, res, next) => {
    try {
        const criteria = req.body;
        const returnFields = ['id', 'email', '-_id'];
        const targetUsers = await UserModel.find(criteria, returnFields).exec();

        res.status(200).json(targetUsers);
    }
    catch (error) {
        console.error(error);
    }
});

const validateUserIdParam = (req, res, next) => {
    const userId = req.params.userId;
    if (!userId) {
        console.error('[error] No id given for /user/:userId endpoint.')
        res.status(400).json({error:{msg:'Please enter a valid user id for the /user/:userId endpoint.'}});
        return;
    }
    if (Number.isNaN(Number(userId))) {
        console.error('[error] Improper id entered in the /user/:userId endpoint.');
        res.status(400).json({error:{msg:'Please enter a proper id in the /user/:userId endpoint. This must be a number.'}});
        return;
    }

    next();
};

/* ~~~ GET '/:user' - Get specific user ~~~ */
router.get('/:userId', validateUserIdParam, async (req, res, next) => {
    try {
        const userId = req.params.userId;

        const returnFields = ['id', 'email', '-_id'];
        const targetUser = await UserModel.findOne({id:userId}, returnFields);

        if (!targetUser) {
            res.status(404).json({});
            return next();
        }

        res.status(200).json(targetUser);
    }
    catch (error) {
        console.error(error);
    }
});

module.exports = router;