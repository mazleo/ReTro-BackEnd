const express = require('express');
const router = express.Router();

const UserModel = require('../model/User');
const { getEntityIdIndexer, incrementEntityIdIndexer } = require('../middleware/entityIdIndexer');

const colorsTools = require('../middleware/colors');

const excludedFields = {
    password: 0,
    _id: 0,
    __v: 0
}

/** ~~~~~~~~~~~~~~~~~~~~~~~~~~ HELPER FUNCTIONS START ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

const respondWithServerError = (res) => {
    res.status(500).json({error:[{msg:"Server unable to process request."}]});
}

const validateEntityIdIndexerExists = (res, entityIdIndexer) => {
    if (!entityIdIndexer) {
        respondWithServerError(res);
        return false;
    }
    return true;
}

const validateWorkspaceNameExists = (res, name) => {
    if (name == null) {
        res.status(400).json({error:[{msg:"The workspace must have a name."}]});
        return false;
    }
    return true;
};

const validateWorkspaceNameIsString = (res, name) => {
    if (typeof name != "string" && !(name instanceof String)) {
        res.status(400).json({error:[{msg:"The workspace name must be a string."}]});
        return false;
    }
    else if (name.length < 1) {
        res.status(400).json({error:[{msg:"The workspace name must be at least 1 character."}]});
        return false;
    }
    return true;
};

const validateWorkspaceId = (res, id) => {
    if (!Number.isInteger(id) || (Number.isInteger(id) && id < 0)) {
        respondWithServerError(res);
        return false;
    }
    return true;
};

const getNewWorkspace = (newWorkspaceName, newWorkspaceColor) => {
    return {
        name: newWorkspaceName,
        color: newWorkspaceColor,
        projects: {}
    };
};

const updateUser = async (email, updatedUser) => {
    return await UserModel.updateOne(
        {email: email},
        updatedUser
    ).exec();
}

const handleSuccessAndRespond = async (res, userUpdateResult, newWorkspace) => {
    if (userUpdateResult['modifiedCount']) {
        await incrementEntityIdIndexer('workspaceIdIndex');
        res.status(201).json(newWorkspace);
        return true;
    }
    return false;
};

const respondWithCreateFailure = (res) => {
    res.status(500).json({error:[{msg:"Unable to create a new workspace."}]});
};

/** ~~~~~~~~~~~~~~~~~~~~~~~~~~ HELPER FUNCTIONS END ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

/** ~~~~~~~~~~~~~~~~~~~~~~~~~~ ROUTES START ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

/**
 * POST /workspace
 * Create a workspace in logged in user's account
 */
router.post('/', async (req, res, next) => {
    try {
        const email = req.email;
        const user = req.user;

        const entityIdIndexer = await getEntityIdIndexer();
        if (!validateEntityIdIndexerExists(res, entityIdIndexer)) return;

        const newWorkspaceId = entityIdIndexer.get('workspaceIdIndex');
        const newWorkspaceName = req.body.name;
        const newWorkspaceColor = colorsTools.getRandomColorId();
        if (!validateWorkspaceId(res, newWorkspaceId)) return;
        if (!validateWorkspaceNameExists(res, newWorkspaceName)) return;
        if (!validateWorkspaceNameIsString(res, newWorkspaceName)) return;
        const newWorkspace = getNewWorkspace(newWorkspaceName, newWorkspaceColor);

        let workspaces = user.workspaces;
        if (!workspaces) workspaces = {};
        workspaces[`${newWorkspaceId}`] = newWorkspace;

        user.workspaces = workspaces;
        const userUpdateResult = await updateUser(email, user);

        if (handleSuccessAndRespond(res, userUpdateResult, newWorkspace)) return;
        else respondWithCreateFailure(res);
    }
    catch (error) {
        console.error(error);
        respondWithServerError(res);
        return;
    }
});

/**
 * GET /
 * @description Get all workspaces
 */
router.get('/', async (req, res, next) => {
    try {
        const email = req.email;
        const user = req.user;

        let workspaces = user.workspaces;
        if (workspaces == null) workspaces = {};

        res.status(200).json(workspaces);
    }
    catch (error) {
        console.error(error);
        respondWithServerError(res);
        return;
    }
});

/**
 * GET /:workspaceId
 * @description Get a specific workspace with an ID
 */
router.get('/:workspaceId', (req, res, next) => {
    try {
        const email = req.email;
        const user = req.user;
        const targetWorkspaceId = req.params.workspaceId;

        let targetWorkspace = user.workspaces[targetWorkspaceId];

        if (targetWorkspace == null) res.status(200).json({});
        else {
            res.status(200).json(targetWorkspace);
        }
    }
    catch (error) {
        console.error(error);
        respondWithServerError(res);
        return;
    }
});


/** ~~~~~~~~~~~~~~~~~~~~~~~~~~ ROUTES END ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

module.exports = router;