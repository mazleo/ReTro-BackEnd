const mongoose = require('mongoose');
const { Schema } = mongoose;

const EntityIdIndexerSchema = new Schema({
    userIdIndex: Number,
    retroCalendarIdIndex: Number,
    workspaceIdIndex: Number,
    projectIdIndex: Number,
    tagIdIndex: Number,
    tagCompositionIdIndex: Number,
    taskIdIndex: Number,
    timesheetIdIndex: Number,
    logIdIndex: Number
});

module.exports = mongoose.model('EntityIdIndexer', EntityIdIndexerSchema);