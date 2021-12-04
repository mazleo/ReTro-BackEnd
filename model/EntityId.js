const mongoose = require('mongoose');
const { Schema } = mongoose;

const EntityIdSchema = new Schema({
    userId: Number,
    retroCalendarId: Number,
    workspaceId: Number,
    projectId: Number,
    tagId: Number,
    tagCompositionId: Number,
    taskId: Number,
    timesheetId: Number,
    logId: Number
});

module.exports = mongoose.model('EntityId', EntityIdSchema);