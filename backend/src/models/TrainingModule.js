const mongoose = require("mongoose");

const trainingStepSchema = new mongoose.Schema(
    {
        stepId: {
            type: String,
            required: true
        },

        type: {
            type: String,
            enum: [
                "identify",
                "interact",
                "navigate",
                "avoid",
                "select"
            ],
            required: true
        },

        instructionKey: {
            type: String,
            required: true
        },

        correctAction: {
            type: String,
            default: ""
        },

        incorrectActions: {
            type: [String],
            default: []
        },

        points: {
            type: Number,
            required: true,
            min: 0
        },

        critical: {
            type: Boolean,
            default: false
        },

        feedbackCorrectKey: {
            type: String,
            required: true
        },

        feedbackIncorrectKey: {
            type: String,
            default: ""
        },

        hintKey: {
            type: String,
            default: ""
        },

        timeLimitSeconds: {
            type: Number,
            default: 0,
            min: 0
        }
    },
    {
        _id: false
    }
);

const trainingModuleSchema = new mongoose.Schema(
    {
        moduleId: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        title: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            required: true
        },

        passingScore: {
            type: Number,
            required: true,
            min: 0,
            max: 100
        },

        version: {
            type: Number,
            default: 1
        },

        isActive: {
            type: Boolean,
            default: true
        },

        steps: {
            type: [trainingStepSchema],
            required: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "TrainingModule",
    trainingModuleSchema
);