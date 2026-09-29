const mongoose = require("mongoose");

const trainingAttemptSchema = new mongoose.Schema(
    {
        worker: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        moduleId: {
            type: String,
            required: true,
            trim: true
        },

        moduleVersion: {
            type: Number,
            required: true
        },

        startedAt: {
            type: Date,
            default: Date.now
        },

        completedAt: {
            type: Date
        },

        scenarioScore: {
            type: Number,
            min: 0,
            max: 100,
            default: 0
        },

        passed: {
            type: Boolean,
            default: false
        },

        result: {
            type: String,
            enum: [
                "in_progress",
                "passed",
                "failed",
                "failed_critical",
                "failed_timeout"
            ],
            default: "in_progress"
        },

        mistakes: {
            type: [
                {
                    stepId: String,
                    action: String
                }
            ],
            default: []
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "TrainingAttempt",
    trainingAttemptSchema
);