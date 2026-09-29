const mongoose = require("mongoose");

const assessmentQuestionSchema = new mongoose.Schema(
    {
        questionId: {
            type: String,
            required: true
        },

        moduleId: {
            type: String,
            required: true,
            trim: true
        },

        questionKey: {
            type: String,
            required: true
        },

        options: {
            type: [String],
            required: true,
            validate: {
                validator: (value) => value.length >= 2,
                message: "A question must have at least two options"
            }
        },

        correctOptionIndex: {
            type: Number,
            required: true,
            min: 0
        },

        safetyWeight: {
            type: Number,
            default: 1,
            min: 1
        },

        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "AssessmentQuestion",
    assessmentQuestionSchema
);