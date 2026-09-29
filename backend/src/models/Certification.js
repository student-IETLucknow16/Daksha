const mongoose = require("mongoose");

const certificationSchema = new mongoose.Schema(
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

        assessmentAttempt: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "AssessmentAttempt",
            required: true
        },

        moduleId: {
            type: String,
            required: true
        },

        scenarioScore: {
            type: Number,
            required: true,
            min: 0,
            max: 100
        },

        quizScore: {
            type: Number,
            required: true,
            min: 0,
            max: 100
        },

        finalScore: {
            type: Number,
            required: true,
            min: 0,
            max: 100
        },

        passed: {
            type: Boolean,
            required: true
        },

        certificateId: {
            type: String,
            unique: true,
            sparse: true
        },

        certificateHash: {
            type: String
        },

        blockchainTransactionId: {
            type: String
        },

        blockchainNetwork: {
            type: String
        },

        blockchainTimestamp: {
            type: Date
        },

        verificationStatus: {
            type: String,
            enum: [
                "not_issued",
                "pending",
                "verified",
                "failed"
            ],
            default: "not_issued"
        },

        issuedAt: {
            type: Date
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "Certification",
    certificationSchema
);