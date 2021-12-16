const express = require('express');
const router = express.Router();

const UserModel = require('../model/User');
const EntityIdIndexer = require('../services/entityIdIndexer');
const {body, param, validationResult} = require('express-validator');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const excludedFields = {
    password: 0,
    _id: 0,
    __v: 0
}

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
            res.status(409).json({error:[{msg:`A user with the email ${newEmail} already exists.`}]})
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
        res.status(201).json({id:newId,email:newEmail});
    }
    catch (error) {
        console.error(error);
        res.status(500).json({error:[{msg:'Unable to create new user.'}]});
    }
});

/* ~~~ GET '/' - Get users with criteria ~~~ */
router.get('/', async (req, res, next) => {
    try {
        const criteria = req.body;
        const targetUsers = await UserModel.find(criteria, excludedFields).exec();

        res.status(200).json(targetUsers);
    }
    catch (error) {
        console.error(error);
    }
});

const userIdValidators = [
    param('userId', 'Please enter a user ID in the path.').exists(checkNull=true),
    param('userId', 'The user ID must be a number').custom(value => !Number.isNaN(Number(value)))
];
router.use('/:userId', userIdValidators, (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({error:errors.array()});
        return;
    }
    
    return next();
});

/* ~~~ GET '/:userId' - Get specific user ~~~ */
router.get('/:userId', userIdValidators, async (req, res, next) => {
    try {
        const userId = req.params.userId;

        const targetUser = await UserModel.findOne({id:userId}, excludedFields);

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

const updateUserValidators = [
    body('email', 'Please enter a valid email.').isEmail().optional(),
    body('password', 'Password must be at least 5 characters and less than 32 characters.').isLength({min: 5, max:32}).optional()
];

/* ~~~ PUT '/:userId' - Update specific user ~~~ */
router.put('/:userId', updateUserValidators, async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({error:errors.array()});
        return;
    }

    try {
        const userId = req.params.userId;
        const update = req.body;

        const plainPassword = update.password;
        if (plainPassword) {
            const encryptedPassword = await bcrypt.hash(plainPassword, saltRounds);
            update.password = encryptedPassword;
        }

        await UserModel.updateOne({id:userId}, update);

        let targetUser = await UserModel.findOne({id:userId}, excludedFields).exec();

        if (!targetUser) {
            res.status(404).json({error:[{msg:`User with ID ${userId} not found.`}]});
            return next();
        }

        res.status(200).json(targetUser);
    }
    catch (error) {
        console.error(error);
    }
});

/* ~~~ DELETE /:userId - delete specific user ~~~ */
router.delete('/:userId', async (req, res, next) => {
    try {
        const targetId = req.params.userId;

        const targetUser = await UserModel.findOneAndDelete({id:targetId}, {projection:excludedFields}).exec();

        if (!targetUser) {
            res.status(404).json({error:[{msg:`User with ID ${targetId} not found.`}]});
            return next();
        }

        res.status(200).json(targetUser);
    }
    catch (error) {
        console.error(error);
    }
});

module.exports = router;