const mongoose = require("mongoose");

const assessmentAnswerSchema = new mongoose.Schema(
    {
        questionId: {
            type: String,
            required: true
        },

        selectedOptionIndex: {
            type: Number,
            required: true
        },

        correct: {
            type: Boolean,
            required: true
        }
    },
    {
        _id: false
    }
);

const assessmentAttemptSchema = new mongoose.Schema(
    {
        worker: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        trainingAttempt: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "TrainingAttempt",
            required: true
        },

        moduleId: {
            type: String,
            required: true,
            trim: true
        },

        answers: {
            type: [assessmentAnswerSchema],
            required: true
        },

        quizScore: {
            type: Number,
            required: true,
            min: 0,
            max: 100
        },

        passed: {
            type: Boolean,
            required: true
        },

        completedAt: {
            type: Date,
            required: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "AssessmentAttempt",
    assessmentAttemptSchema
);