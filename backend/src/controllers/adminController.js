const User = require("../models/User");
const TrainingAttempt = require("../models/TrainingAttempt");
const AssessmentAttempt = require("../models/AssessmentAttempt");
const Certification = require("../models/Certification");
const TrainingModule = require("../models/TrainingModule");

const getAdminDashboard = async (req, res) => {
    try {
        // User statistics
        const totalWorkers =
            await User.countDocuments({
                role: "worker"
            });

        const totalAdmins =
            await User.countDocuments({
                role: "admin"
            });

        const totalSiteOfficers =
            await User.countDocuments({
                role: "site_officer"
            });

        const activeWorkers =
            await User.countDocuments({
                role: "worker",
                active: true
            });

        // Training statistics
        const totalTrainingAttempts =
            await TrainingAttempt.countDocuments();

        const completedTraining =
            await TrainingAttempt.countDocuments({
                completedAt: {
                    $exists: true,
                    $ne: null
                }
            });

        const passedTraining =
            await TrainingAttempt.countDocuments({
                passed: true
            });

        // Assessment statistics
        const totalAssessments =
            await AssessmentAttempt.countDocuments();

        const passedAssessments =
            await AssessmentAttempt.countDocuments({
                passed: true
            });

        // Certification statistics
        const totalCertificates =
            await Certification.countDocuments();

        const passedCertificates =
            await Certification.countDocuments({
                passed: true
            });

        const verifiedCertificates =
            await Certification.countDocuments({
                verificationStatus: "verified"
            });

        const failedBlockchainCertificates =
            await Certification.countDocuments({
                verificationStatus: "failed"
            });

        // Training modules
        const totalTrainingModules =
            await TrainingModule.countDocuments();

        const activeTrainingModules =
            await TrainingModule.countDocuments({
                isActive: true
            });

        // Recent certifications
        const recentCertificates =
            await Certification.find()
                .populate(
                    "worker",
                    "name email site"
                )
                .sort({ createdAt: -1 })
                .limit(10);

        // Recent training activity
        const recentTraining =
            await TrainingAttempt.find()
                .populate(
                    "worker",
                    "name email site"
                )
                .sort({ createdAt: -1 })
                .limit(10);

        return res.json({
            success: true,

            users: {
                totalWorkers,
                activeWorkers,
                totalAdmins,
                totalSiteOfficers
            },

            training: {
                totalTrainingModules,
                activeTrainingModules,
                totalAttempts:
                    totalTrainingAttempts,
                completedAttempts:
                    completedTraining,
                passedAttempts:
                    passedTraining
            },

            assessments: {
                totalAttempts:
                    totalAssessments,
                passedAttempts:
                    passedAssessments
            },

            certifications: {
                total:
                    totalCertificates,
                passed:
                    passedCertificates,
                blockchainVerified:
                    verifiedCertificates,
                blockchainFailed:
                    failedBlockchainCertificates
            },

            recentCertificates,
            recentTraining
        });

    } catch (error) {
        console.error(
            "Get admin dashboard error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Server error while fetching admin dashboard"
        });
    }
};
const getAdminWorkers = async (req, res) => {
    try {
        const { search, site, active } = req.query;

        const filter = {
            role: "worker"
        };

        // Search by name or email
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } }
            ];
        }

        // Filter by site
        if (site) {
            filter.site = site;
        }

        // Filter by active status
        if (active !== undefined) {
            filter.active = active === "true";
        }

        const workers = await User.find(filter)
            .select(
                "name email role preferredLanguage site active createdAt"
            )
            .sort({ createdAt: -1 });

        const workerIds = workers.map((worker) => worker._id);

        const trainingAttempts = await TrainingAttempt.find({
            worker: { $in: workerIds }
        });

        const assessmentAttempts = await AssessmentAttempt.find({
            worker: { $in: workerIds }
        });

        const certifications = await Certification.find({
            worker: { $in: workerIds }
        });

        const workerData = workers.map((worker) => {
            const workerTraining = trainingAttempts.filter(
                (attempt) =>
                    attempt.worker.toString() === worker._id.toString()
            );

            const workerAssessments = assessmentAttempts.filter(
                (attempt) =>
                    attempt.worker.toString() === worker._id.toString()
            );

            const workerCertificates = certifications.filter(
                (certificate) =>
                    certificate.worker.toString() === worker._id.toString()
            );

            return {
                id: worker._id,
                name: worker.name,
                email: worker.email,
                preferredLanguage: worker.preferredLanguage,
                site: worker.site,
                active: worker.active,
                createdAt: worker.createdAt,

                statistics: {
                    trainingAttempts: workerTraining.length,
                    completedTraining: workerTraining.filter(
                        (attempt) => attempt.completedAt
                    ).length,
                    passedTraining: workerTraining.filter(
                        (attempt) => attempt.passed
                    ).length,

                    assessmentAttempts: workerAssessments.length,
                    passedAssessments: workerAssessments.filter(
                        (attempt) => attempt.passed
                    ).length,

                    certificates: workerCertificates.length,
                    verifiedCertificates: workerCertificates.filter(
                        (certificate) =>
                            certificate.verificationStatus === "verified"
                    ).length
                }
            };
        });

        return res.json({
            success: true,
            count: workerData.length,
            workers: workerData
        });
    } catch (error) {
        console.error("Get admin workers error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while fetching workers"
        });
    }
};


const getAdminWorkerDetails = async (req, res) => {
    try {
        const { id } = req.params;

        const worker = await User.findOne({
            _id: id,
            role: "worker"
        }).select(
            "name email role preferredLanguage site active createdAt"
        );

        if (!worker) {
            return res.status(404).json({
                success: false,
                message: "Worker not found"
            });
        }

        const trainingAttempts = await TrainingAttempt.find({
            worker: worker._id
        }).sort({ createdAt: -1 });

        const assessmentAttempts = await AssessmentAttempt.find({
            worker: worker._id
        }).sort({ createdAt: -1 });

        const certifications = await Certification.find({
            worker: worker._id
        }).sort({ createdAt: -1 });

        return res.json({
            success: true,

            worker: {
                id: worker._id,
                name: worker.name,
                email: worker.email,
                role: worker.role,
                preferredLanguage: worker.preferredLanguage,
                site: worker.site,
                active: worker.active,
                createdAt: worker.createdAt
            },

            statistics: {
                trainingAttempts: trainingAttempts.length,
                completedTraining: trainingAttempts.filter(
                    (attempt) => attempt.completedAt
                ).length,
                passedTraining: trainingAttempts.filter(
                    (attempt) => attempt.passed
                ).length,

                assessmentAttempts: assessmentAttempts.length,
                passedAssessments: assessmentAttempts.filter(
                    (attempt) => attempt.passed
                ).length,

                certificates: certifications.length,
                verifiedCertificates: certifications.filter(
                    (certificate) =>
                        certificate.verificationStatus === "verified"
                ).length
            },

            trainingHistory: trainingAttempts,
            assessmentHistory: assessmentAttempts,
            certificates
        });
    } catch (error) {
        console.error("Get admin worker details error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while fetching worker details"
        });
    }
};
const getAdminTraining = async (req, res) => {
    try {
        const trainingAttempts = await TrainingAttempt.find()
            .populate("worker", "name email site")
            .sort({ createdAt: -1 });

        const totalAttempts = trainingAttempts.length;

        const completedAttempts = trainingAttempts.filter(
            (attempt) => attempt.completedAt
        );

        const passedAttempts = trainingAttempts.filter(
            (attempt) => attempt.passed
        );

        const failedAttempts = trainingAttempts.filter(
            (attempt) => attempt.completedAt && !attempt.passed
        );

        const scores = completedAttempts.map(
            (attempt) => attempt.scenarioScore
        );

        const averageScenarioScore =
            scores.length > 0
                ? Math.round(
                      scores.reduce((sum, score) => sum + score, 0) /
                          scores.length
                  )
                : 0;

        // Module-wise statistics
        const moduleMap = {};

        for (const attempt of trainingAttempts) {
            if (!moduleMap[attempt.moduleId]) {
                moduleMap[attempt.moduleId] = {
                    moduleId: attempt.moduleId,
                    totalAttempts: 0,
                    completed: 0,
                    passed: 0,
                    failed: 0,
                    scores: []
                };
            }

            const module = moduleMap[attempt.moduleId];

            module.totalAttempts++;

            if (attempt.completedAt) {
                module.completed++;
            }

            if (attempt.passed) {
                module.passed++;
            }

            if (attempt.completedAt && !attempt.passed) {
                module.failed++;
            }

            if (attempt.completedAt) {
                module.scores.push(attempt.scenarioScore);
            }
        }

        const moduleStatistics = Object.values(moduleMap).map((module) => {
            const averageScore =
                module.scores.length > 0
                    ? Math.round(
                          module.scores.reduce(
                              (sum, score) => sum + score,
                              0
                          ) / module.scores.length
                      )
                    : 0;

            return {
                moduleId: module.moduleId,
                totalAttempts: module.totalAttempts,
                completed: module.completed,
                passed: module.passed,
                failed: module.failed,
                averageScenarioScore: averageScore
            };
        });

        return res.json({
            success: true,

            statistics: {
                totalAttempts,
                completed: completedAttempts.length,
                passed: passedAttempts.length,
                failed: failedAttempts.length,
                averageScenarioScore
            },

            moduleStatistics,

            recentAttempts: trainingAttempts.slice(0, 20)
        });
    } catch (error) {
        console.error("Get admin training error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while fetching training data"
        });
    }
};
const getAdminAssessments = async (req, res) => {
    try {
        const assessmentAttempts = await AssessmentAttempt.find()
            .populate("worker", "name email site")
            .sort({ createdAt: -1 });

        const totalAttempts = assessmentAttempts.length;

        const passedAttempts = assessmentAttempts.filter(
            (attempt) => attempt.passed
        );

        const failedAttempts = assessmentAttempts.filter(
            (attempt) => !attempt.passed
        );

        const scores = assessmentAttempts.map(
            (attempt) => attempt.quizScore
        );

        const averageQuizScore =
            scores.length > 0
                ? Math.round(
                      scores.reduce((sum, score) => sum + score, 0) /
                          scores.length
                  )
                : 0;

        // Module-wise assessment statistics
        const moduleMap = {};

        for (const attempt of assessmentAttempts) {
            if (!moduleMap[attempt.moduleId]) {
                moduleMap[attempt.moduleId] = {
                    moduleId: attempt.moduleId,
                    totalAttempts: 0,
                    passed: 0,
                    failed: 0,
                    scores: []
                };
            }

            const module = moduleMap[attempt.moduleId];

            module.totalAttempts++;

            if (attempt.passed) {
                module.passed++;
            } else {
                module.failed++;
            }

            module.scores.push(attempt.quizScore);
        }

        const moduleStatistics = Object.values(moduleMap).map((module) => {
            const averageQuizScore =
                module.scores.length > 0
                    ? Math.round(
                          module.scores.reduce(
                              (sum, score) => sum + score,
                              0
                          ) / module.scores.length
                      )
                    : 0;

            return {
                moduleId: module.moduleId,
                totalAttempts: module.totalAttempts,
                passed: module.passed,
                failed: module.failed,
                averageQuizScore
            };
        });

        return res.json({
            success: true,

            statistics: {
                totalAttempts,
                passed: passedAttempts.length,
                failed: failedAttempts.length,
                averageQuizScore
            },

            moduleStatistics,

            recentAttempts: assessmentAttempts.slice(0, 20)
        });
    } catch (error) {
        console.error("Get admin assessments error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while fetching assessment data"
        });
    }
};
const getAdminCertifications = async (req, res) => {
    try {
        const certifications = await Certification.find()
            .populate("worker", "name email site")
            .populate("trainingAttempt", "moduleId scenarioScore passed")
            .populate("assessmentAttempt", "moduleId quizScore passed")
            .sort({ createdAt: -1 });

        const totalCertificates = certifications.length;

        const passedCertificates = certifications.filter(
            (certificate) => certificate.passed
        );

        const verifiedCertificates = certifications.filter(
            (certificate) =>
                certificate.verificationStatus === "verified"
        );

        const pendingCertificates = certifications.filter(
            (certificate) =>
                certificate.verificationStatus === "pending"
        );

        const failedBlockchainCertificates = certifications.filter(
            (certificate) =>
                certificate.verificationStatus === "failed"
        );

        const averageFinalScore =
            totalCertificates > 0
                ? Math.round(
                      certifications.reduce(
                          (sum, certificate) =>
                              sum + certificate.finalScore,
                          0
                      ) / totalCertificates
                  )
                : 0;

        return res.json({
            success: true,

            statistics: {
                totalCertificates,
                passedCertificates: passedCertificates.length,
                verifiedCertificates: verifiedCertificates.length,
                pendingCertificates: pendingCertificates.length,
                failedBlockchainCertificates:
                    failedBlockchainCertificates.length,
                averageFinalScore
            },

            certificates: certifications
        });
    } catch (error) {
        console.error(
            "Get admin certifications error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Server error while fetching certification data"
        });
    }
};
const getAdminAnalytics = async (req, res) => {
    try {
        const workers = await User.find({
            role: "worker"
        }).select("_id site active");

        const trainingAttempts = await TrainingAttempt.find();
        const assessmentAttempts = await AssessmentAttempt.find();
        const certifications = await Certification.find();

        const totalWorkers = workers.length;
        const activeWorkers = workers.filter(
            (worker) => worker.active
        ).length;

        const completedTraining = trainingAttempts.filter(
            (attempt) => attempt.completedAt
        );

        const passedTraining = trainingAttempts.filter(
            (attempt) => attempt.passed
        );

        const passedAssessments = assessmentAttempts.filter(
            (attempt) => attempt.passed
        );

        const verifiedCertificates = certifications.filter(
            (certificate) =>
                certificate.verificationStatus === "verified"
        );

        const trainingScores = completedTraining.map(
            (attempt) => attempt.scenarioScore
        );

        const assessmentScores = assessmentAttempts.map(
            (attempt) => attempt.quizScore
        );

        const certificateScores = certifications.map(
            (certificate) => certificate.finalScore
        );

        const calculateAverage = (values) => {
            if (values.length === 0) {
                return 0;
            }

            return Math.round(
                values.reduce((sum, value) => sum + value, 0) /
                    values.length
            );
        };

        const trainingPassRate =
            completedTraining.length > 0
                ? Math.round(
                      (passedTraining.length /
                          completedTraining.length) *
                          100
                  )
                : 0;

        const assessmentPassRate =
            assessmentAttempts.length > 0
                ? Math.round(
                      (passedAssessments.length /
                          assessmentAttempts.length) *
                          100
                  )
                : 0;

        // Site-wise statistics
        const siteMap = {};

        for (const worker of workers) {
            const site = worker.site || "Unassigned";

            if (!siteMap[site]) {
                siteMap[site] = {
                    site,
                    workers: 0,
                    activeWorkers: 0,
                    trainingAttempts: 0,
                    passedTraining: 0,
                    assessments: 0,
                    passedAssessments: 0,
                    certificates: 0
                };
            }

            siteMap[site].workers++;

            if (worker.active) {
                siteMap[site].activeWorkers++;
            }
        }

        for (const attempt of trainingAttempts) {
            const worker = workers.find(
                (item) =>
                    item._id.toString() ===
                    attempt.worker.toString()
            );

            if (!worker) {
                continue;
            }

            const site = worker.site || "Unassigned";

            siteMap[site].trainingAttempts++;

            if (attempt.passed) {
                siteMap[site].passedTraining++;
            }
        }

        for (const attempt of assessmentAttempts) {
            const worker = workers.find(
                (item) =>
                    item._id.toString() ===
                    attempt.worker.toString()
            );

            if (!worker) {
                continue;
            }

            const site = worker.site || "Unassigned";

            siteMap[site].assessments++;

            if (attempt.passed) {
                siteMap[site].passedAssessments++;
            }
        }

        for (const certificate of certifications) {
            const worker = workers.find(
                (item) =>
                    item._id.toString() ===
                    certificate.worker.toString()
            );

            if (!worker) {
                continue;
            }

            const site = worker.site || "Unassigned";

            siteMap[site].certificates++;
        }

        return res.json({
            success: true,

            overview: {
                totalWorkers,
                activeWorkers,

                totalTrainingAttempts: trainingAttempts.length,
                completedTraining: completedTraining.length,
                passedTraining: passedTraining.length,
                trainingPassRate,

                totalAssessments: assessmentAttempts.length,
                passedAssessments: passedAssessments.length,
                assessmentPassRate,

                totalCertificates: certifications.length,
                verifiedCertificates: verifiedCertificates.length,

                averageScenarioScore:
                    calculateAverage(trainingScores),

                averageQuizScore:
                    calculateAverage(assessmentScores),

                averageFinalScore:
                    calculateAverage(certificateScores)
            },

            siteStatistics: Object.values(siteMap)
        });
    } catch (error) {
        console.error(
            "Get admin analytics error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Server error while fetching analytics"
        });
    }
};

module.exports = {
    getAdminDashboard,
    getAdminWorkerDetails,
    getAdminWorkers,
    getAdminTraining,
    getAdminAssessments,
    getAdminCertifications,
    getAdminAnalytics
};
   
