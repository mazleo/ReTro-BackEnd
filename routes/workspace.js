const express = require('express');
const router = express.Router();

const UserModel = require('../model/User');
const { getEntityIdIndexer, incrementEntityIdIndexer } = require('../middleware/entityIdIndexer');

const excludedFields = {
    password: 0,
    _id: 0,
    __v: 0
}
const colorsTools = require('../middleware/colors');

router.post('/', async (req, res, next) => {
    try {
        const user = await UserModel.findOne({email: req.email}, excludedFields).exec();
        const entityIdIndexer = await getEntityIdIndexer();

        if (!entityIdIndexer) {
            res.status(500).json({error:[{msg:"Server unable to process request."}]});
            return;
        }
        if (typeof req.body.name != "string" && !(req.body.name instanceof String)) {
            res.status(400).json({error:[{msg:"The workspace name must be a string."}]});
            return;
        }
        else if (req.body.name.length < 1) {
            res.status(400).json({error:[{msg:"The workspace name must be at least 1 character."}]});
            return;
        }

        let workspaces = user.get('workspaces');
        if (!workspaces) {
            workspaces = new Map();
        }

        const newWorkspaceId = entityIdIndexer.get('workspaceIdIndex');
        if (!Number.isInteger(newWorkspaceId) || (Number.isInteger(newWorkspaceId) && newWorkspaceId < 0)) {
            res.status(500).json({error:[{msg:"Server unable to process request."}]});
            return;
        }
        const newWorkspaceColor = colorsTools.getRandomColorId();
        const newWorkspaceName = req.body.name;

        const newWorkspace = {
            color: newWorkspaceColor,
            name: newWorkspaceName,
            projects: {}
        };

        workspaces.set(`${newWorkspaceId}`, newWorkspace);
        user.set('workspaces', workspaces);

        const userUpdateResult = await UserModel.updateOne(
            {email: req.email},
            user
        ).exec();

        if (userUpdateResult['modifiedCount']) {
            await incrementEntityIdIndexer('workspaceIdIndex');
            res.status(201).json(newWorkspace);
            return;
        }
        else {
            res.status(500).json({error:[{msg:"Unable to create a new workspace."}]});
            return;
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({error:[{msg:"Unable to execute request."}]});
        return;
    }
});

module.exports = router;