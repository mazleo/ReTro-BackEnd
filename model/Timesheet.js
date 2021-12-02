const mongoose = require('mongoose');
const { Schema } = mongoose;

const TimesheetSchema = new Schema({
    type: Map,
    of: new Schema({
        id: String,
        userId: String,
        checksums: {
            type: Map,
            of: String
        },
        logs: {
            byDays: {
                type: Map,
                of: new Schema({
                    type: Map,
                    of: new Schema({
                        task: String,
                        startTime: mongoose.Decimal128,
                        endTime: mongoose.Decimal128,
                        duration: mongoose.Decimal128,
                        notes: String,
                        googleId: String
                    })
                })
            },
            index: {
                byTaskName: [
                    {
                        type: Map,
                        of: new Schema({
                            type: Map,
                            of: Boolean
                        })
                    }
                ]
            }
        }
    })
});

module.exports = mongoose.model('Timesheet', TimesheetSchema);