const User = require("../models/User");
const TrainingAttempt = require("../models/TrainingAttempt");
const AssessmentAttempt = require("../models/AssessmentAttempt");
const Certification = require("../models/Certification");

const getWorkerDashboard = async (req, res) => {
    try {
        const workerId = req.user._id;

        const worker = await User.findById(workerId).select(
            "name email role preferredLanguage site active"
        );

        if (!worker) {
            return res.status(404).json({
                success: false,
                message: "Worker not found"
            });
        }

        const trainingAttempts =
            await TrainingAttempt.find({
                worker: workerId
            }).sort({ createdAt: -1 });

        const assessmentAttempts =
            await AssessmentAttempt.find({
                worker: workerId
            }).sort({ createdAt: -1 });

        const certifications =
            await Certification.find({
                worker: workerId
            }).sort({ createdAt: -1 });

        const completedTraining =
            trainingAttempts.filter(
                (attempt) => attempt.completedAt
            );

        const passedTraining =
            trainingAttempts.filter(
                (attempt) => attempt.passed
            );

        const passedAssessments =
            assessmentAttempts.filter(
                (attempt) => attempt.passed
            );

        const verifiedCertificates =
            certifications.filter(
                (certificate) =>
                    certificate.verificationStatus === "verified"
            );

        return res.json({
            success: true,

            worker: {
                id: worker._id,
                name: worker.name,
                email: worker.email,
                role: worker.role,
                preferredLanguage:
                    worker.preferredLanguage,
                site: worker.site,
                active: worker.active
            },

            statistics: {
                totalTrainingAttempts:
                    trainingAttempts.length,

                completedTraining:
                    completedTraining.length,

                passedTraining:
                    passedTraining.length,

                totalAssessments:
                    assessmentAttempts.length,

                passedAssessments:
                    passedAssessments.length,

                totalCertificates:
                    certifications.length,

                verifiedCertificates:
                    verifiedCertificates.length
            },

            recentTraining:
                trainingAttempts.slice(0, 5),

            recentAssessments:
                assessmentAttempts.slice(0, 5),

            recentCertificates:
                certifications.slice(0, 5)
        });

    } catch (error) {
        console.error(
            "Get worker dashboard error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Server error while fetching worker dashboard"
        });
    }
};

const getWorkerProfile = async (req, res) => {
    try {
        const worker = await User.findById(req.user._id).select(
            "name email role preferredLanguage site active createdAt"
        );

        if (!worker) {
            return res.status(404).json({
                success: false,
                message: "Worker not found"
            });
        }

        return res.json({
            success: true,
            worker: {
                id: worker._id,
                name: worker.name,
                email: worker.email,
                role: worker.role,
                preferredLanguage:
                    worker.preferredLanguage,
                site: worker.site,
                active: worker.active,
                createdAt: worker.createdAt
            }
        });

    } catch (error) {
        console.error(
            "Get worker profile error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Server error while fetching worker profile"
        });
    }
};

const getWorkerProgress = async (req, res) => {
    try {
        const workerId = req.user._id;

        const trainingAttempts =
            await TrainingAttempt.find({
                worker: workerId
            }).sort({ createdAt: -1 });

        const assessmentAttempts =
            await AssessmentAttempt.find({
                worker: workerId
            }).sort({ createdAt: -1 });

        const certifications =
            await Certification.find({
                worker: workerId
            }).sort({ createdAt: -1 });

        const completedTraining =
            trainingAttempts.filter(
                (attempt) => attempt.completedAt
            );

        const passedTraining =
            trainingAttempts.filter(
                (attempt) => attempt.passed
            );

        const passedAssessments =
            assessmentAttempts.filter(
                (attempt) => attempt.passed
            );

        const verifiedCertificates =
            certifications.filter(
                (certificate) =>
                    certificate.verificationStatus ===
                    "verified"
            );

        return res.json({
            success: true,

            progress: {
                training: {
                    totalAttempts:
                        trainingAttempts.length,

                    completed:
                        completedTraining.length,

                    passed:
                        passedTraining.length
                },

                assessments: {
                    totalAttempts:
                        assessmentAttempts.length,

                    passed:
                        passedAssessments.length
                },

                certifications: {
                    total:
                        certifications.length,

                    verified:
                        verifiedCertificates.length
                }
            },

            trainingHistory:
                trainingAttempts,

            assessmentHistory:
                assessmentAttempts,

            certifications
        });

    } catch (error) {
        console.error(
            "Get worker progress error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Server error while fetching worker progress"
        });
    }
};
const getWorkerCertificates = async (req, res) => {
    try {
        const certificates =
            await Certification.find({
                worker: req.user._id
            }).sort({ createdAt: -1 });

        return res.json({
            success: true,
            count: certificates.length,
            certificates
        });

    } catch (error) {
        console.error(
            "Get worker certificates error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Server error while fetching certificates"
        });
    }
};
const getWorkerTrainingHistory = async (req, res) => {
    try {
        const attempts = await TrainingAttempt.find({
            worker: req.user._id
        })
            .sort({ createdAt: -1 })
            .lean();

        return res.json({
            success: true,
            count: attempts.length,
            history: attempts
        });
    } catch (error) {
        console.error(
            "Get worker training history error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Server error while fetching training history"
        });
    }
};


const getWorkerAssessmentHistory = async (req, res) => {
    try {
        const attempts = await AssessmentAttempt.find({
            worker: req.user._id
        })
            .sort({ createdAt: -1 })
            .lean();

        return res.json({
            success: true,
            count: attempts.length,
            history: attempts
        });
    } catch (error) {
        console.error(
            "Get worker assessment history error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Server error while fetching assessment history"
        });
    }
};

module.exports = {
    getWorkerDashboard,
    getWorkerProfile,
    getWorkerProgress,
    getWorkerCertificates,
    getWorkerTrainingHistory,
    getWorkerAssessmentHistory
};
