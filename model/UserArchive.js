const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserSchema = new Schema({
    email: String,
    schemaVersion: Number,
    id: String,
    password: String,
    name: String,
    email: String,
    retroCalendar: {
        id: String,
        googleId: String
    },
    workspaces: {
        type: Map,
        of: new Schema ({
            color: Number,
            projects: {
                type: Map,
                of: new Schema({
                    color: Number,
                    tags: {
                        byId: {
                            type: Map,
                            of: new Schema({
                                name: String,
                                color: Number
                            })
                        },
                        index: [
                            {
                                type: Map,
                                of: new Schema({
                                    type: Map,
                                    of: Boolean
                                })
                            }
                        ]
                    },
                    tagCompositions: {
                        index: {
                            type: Map,
                            of: new Schema({
                                type: Map,
                                of: Boolean
                            })
                        },
                        byId: {
                            type: Map,
                            of: new Schema({
                                tags: [String],
                                tasks: [String],
                                durationSum: mongoose.Decimal128,
                                numberOfTasks: Number,
                                durationAverage: mongoose.Decimal128,
                                durationStandardDeviation: mongoose.Decimal128,
                                durationEstimate: mongoose.Decimal128,
                                durationInitialEstimate: mongoose.Decimal128
                            })
                        }
                    },
                    tasks: {
                        byId: {
                            type: Map,
                            of: new Schema({
                                name: String,
                                description: String,
                                billingType: String,
                                tags: {
                                    type: Map,
                                    of: Boolean
                                },
                                logs: {
                                    type: Map,
                                    of: new Schema({
                                        type: Map,
                                        of: new Schema({
                                            duration: mongoose.Decimal128
                                        })
                                    })
                                },
                                actualDuration: mongoose.Decimal128,
                                creationDate: Date,
                                completionDate: Date,
                                firstLogDate: Date,
                                lastLogDate: Date,
                                assignedDuration: mongoose.Decimal128
                            }),
                        },
                        index: {
                            byState: {
                                todo: {
                                    type: Map,
                                    of: Boolean
                                },
                                inProgress: {
                                    type: Map,
                                    of: Boolean
                                },
                                done: {
                                    type: Map,
                                    of: Boolean
                                }
                            },
                            byDeadline: {
                                type: Map,
                                of: new Schema({
                                    type: Map,
                                    of: Boolean
                                })
                            },
                            byTag: {
                                type: Map,
                                of: new Schema({
                                    type: Map,
                                    of: Boolean
                                })
                            }
                        }
                    }
                })
            }
        })
    }
});

UserSchema.index({email: 1});

const date = new Date();
const month = date.getMonth() + 1;
const year = date.getFullYear();
module.exports = mongoose.model(`UserArchive-${month}${year}`, UserSchema);