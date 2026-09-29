const User = require("../models/User");
const TrainingAttempt = require("../models/TrainingAttempt");
const AssessmentAttempt = require("../models/AssessmentAttempt");
const Certification = require("../models/Certification");

const getSiteOfficerDashboard = async (req, res) => {
    try {
        const officer = await User.findById(req.user._id).select(
            "name email role site active"
        );

        if (!officer) {
            return res.status(404).json({
                success: false,
                message: "Site officer not found"
            });
        }

        if (!officer.site) {
            return res.status(400).json({
                success: false,
                message:
                    "Site officer is not assigned to a site"
            });
        }

        const site = officer.site;

        // Find workers belonging to this site
        const workers = await User.find({
            role: "worker",
            site: site
        }).select(
            "name email preferredLanguage site active"
        );

        const workerIds = workers.map(
            (worker) => worker._id
        );

        // Training data for this site
        const trainingAttempts =
            await TrainingAttempt.find({
                worker: { $in: workerIds }
            })
                .populate(
                    "worker",
                    "name email site"
                )
                .sort({ createdAt: -1 });

        // Assessment data for this site
        const assessmentAttempts =
            await AssessmentAttempt.find({
                worker: { $in: workerIds }
            })
                .populate(
                    "worker",
                    "name email site"
                )
                .sort({ createdAt: -1 });

        // Certification data for this site
        const certifications =
            await Certification.find({
                worker: { $in: workerIds }
            })
                .populate(
                    "worker",
                    "name email site"
                )
                .sort({ createdAt: -1 });

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

            siteOfficer: {
                id: officer._id,
                name: officer.name,
                email: officer.email,
                role: officer.role,
                site: officer.site,
                active: officer.active
            },

            statistics: {
                totalWorkers:
                    workers.length,

                activeWorkers:
                    workers.filter(
                        (worker) => worker.active
                    ).length,

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

            workers,

            recentTraining:
                trainingAttempts.slice(0, 10),

            recentAssessments:
                assessmentAttempts.slice(0, 10),

            recentCertificates:
                certifications.slice(0, 10)
        });

    } catch (error) {
        console.error(
            "Get site officer dashboard error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Server error while fetching site officer dashboard"
        });
    }
};
const getSiteOfficerWorkers = async (req, res) => {
    try {
        const officer = await User.findById(req.user._id).select(
            "name email role site active"
        );

        if (!officer) {
            return res.status(404).json({
                success: false,
                message: "Site officer not found"
            });
        }

        if (!officer.site) {
            return res.status(400).json({
                success: false,
                message: "Site officer is not assigned to a site"
            });
        }

        const workers = await User.find({
            role: "worker",
            site: officer.site
        }).select(
            "name email preferredLanguage site active createdAt"
        );

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
                    attempt.worker.toString() ===
                    worker._id.toString()
            );

            const workerAssessments = assessmentAttempts.filter(
                (attempt) =>
                    attempt.worker.toString() ===
                    worker._id.toString()
            );

            const workerCertificates = certifications.filter(
                (certificate) =>
                    certificate.worker.toString() ===
                    worker._id.toString()
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

                    assessmentAttempts:
                        workerAssessments.length,

                    passedAssessments:
                        workerAssessments.filter(
                            (attempt) => attempt.passed
                        ).length,

                    certificates:
                        workerCertificates.length,

                    verifiedCertificates:
                        workerCertificates.filter(
                            (certificate) =>
                                certificate.verificationStatus ===
                                "verified"
                        ).length
                }
            };
        });

        return res.json({
            success: true,
            site: officer.site,
            count: workerData.length,
            workers: workerData
        });
    } catch (error) {
        console.error(
            "Get site officer workers error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Server error while fetching site workers"
        });
    }
};
const getSiteOfficerWorkerDetails = async (req, res) => {
    try {
        const officer = await User.findById(req.user._id).select(
            "site"
        );

        if (!officer) {
            return res.status(404).json({
                success: false,
                message: "Site officer not found"
            });
        }

        if (!officer.site) {
            return res.status(400).json({
                success: false,
                message: "Site officer is not assigned to a site"
            });
        }

        const worker = await User.findOne({
            _id: req.params.id,
            role: "worker",
            site: officer.site
        }).select(
            "name email role preferredLanguage site active createdAt"
        );

        if (!worker) {
            return res.status(404).json({
                success: false,
                message:
                    "Worker not found in your assigned site"
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
                preferredLanguage:
                    worker.preferredLanguage,
                site: worker.site,
                active: worker.active,
                createdAt: worker.createdAt
            },

            statistics: {
                trainingAttempts:
                    trainingAttempts.length,

                completedTraining:
                    trainingAttempts.filter(
                        (attempt) => attempt.completedAt
                    ).length,

                passedTraining:
                    trainingAttempts.filter(
                        (attempt) => attempt.passed
                    ).length,

                assessmentAttempts:
                    assessmentAttempts.length,

                passedAssessments:
                    assessmentAttempts.filter(
                        (attempt) => attempt.passed
                    ).length,

                certificates:
                    certifications.length,

                verifiedCertificates:
                    certifications.filter(
                        (certificate) =>
                            certificate.verificationStatus ===
                            "verified"
                    ).length
            },

            trainingHistory: trainingAttempts,
            assessmentHistory: assessmentAttempts,
            certificates: certifications
        });
    } catch (error) {
        console.error(
            "Get site officer worker details error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Server error while fetching worker details"
        });
    }
};
const getSiteOfficerTraining = async (req, res) => {
    try {
        const officer = await User.findById(req.user._id).select("site");

        if (!officer) {
            return res.status(404).json({
                success: false,
                message: "Site officer not found"
            });
        }

        if (!officer.site) {
            return res.status(400).json({
                success: false,
                message: "Site officer is not assigned to a site"
            });
        }

        const workers = await User.find({
            role: "worker",
            site: officer.site
        }).select("_id name email site");

        const workerIds = workers.map((worker) => worker._id);

        const trainingAttempts = await TrainingAttempt.find({
            worker: { $in: workerIds }
        })
            .populate("worker", "name email site")
            .sort({ createdAt: -1 });

        const completedAttempts = trainingAttempts.filter(
            (attempt) => attempt.completedAt
        );

        const passedAttempts = trainingAttempts.filter(
            (attempt) => attempt.passed
        );

        const failedAttempts = completedAttempts.filter(
            (attempt) => !attempt.passed
        );

        const scores = completedAttempts.map(
            (attempt) => attempt.scenarioScore
        );

        const averageScenarioScore =
            scores.length > 0
                ? Math.round(
                      scores.reduce(
                          (sum, score) => sum + score,
                          0
                      ) / scores.length
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
                module.scores.push(attempt.scenarioScore);
            }

            if (attempt.passed) {
                module.passed++;
            }

            if (attempt.completedAt && !attempt.passed) {
                module.failed++;
            }
        }

        const moduleStatistics = Object.values(moduleMap).map(
            (module) => {
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
            }
        );

        return res.json({
            success: true,

            site: officer.site,

            statistics: {
                totalWorkers: workers.length,
                totalAttempts: trainingAttempts.length,
                completed: completedAttempts.length,
                passed: passedAttempts.length,
                failed: failedAttempts.length,
                averageScenarioScore,
                trainingPassRate:
                    completedAttempts.length > 0
                        ? Math.round(
                              (passedAttempts.length /
                                  completedAttempts.length) *
                                  100
                          )
                        : 0
            },

            moduleStatistics,

            recentAttempts: trainingAttempts.slice(0, 20)
        });
    } catch (error) {
        console.error(
            "Get site officer training error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Server error while fetching site training data"
        });
    }
};
const getSiteOfficerAssessments = async (req, res) => {
    try {
        const officer = await User.findById(req.user._id).select("site");

        if (!officer) {
            return res.status(404).json({
                success: false,
                message: "Site officer not found"
            });
        }

        if (!officer.site) {
            return res.status(400).json({
                success: false,
                message: "Site officer is not assigned to a site"
            });
        }

        const workers = await User.find({
            role: "worker",
            site: officer.site
        }).select("_id name email site");

        const workerIds = workers.map((worker) => worker._id);

        const assessmentAttempts = await AssessmentAttempt.find({
            worker: { $in: workerIds }
        })
            .populate("worker", "name email site")
            .sort({ createdAt: -1 });

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
                      scores.reduce(
                          (sum, score) => sum + score,
                          0
                      ) / scores.length
                  )
                : 0;

        // Module-wise statistics
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

        const moduleStatistics = Object.values(moduleMap).map(
            (module) => {
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
            }
        );

        return res.json({
            success: true,

            site: officer.site,

            statistics: {
                totalWorkers: workers.length,
                totalAttempts: assessmentAttempts.length,
                passed: passedAttempts.length,
                failed: failedAttempts.length,
                averageQuizScore,

                assessmentPassRate:
                    assessmentAttempts.length > 0
                        ? Math.round(
                              (passedAttempts.length /
                                  assessmentAttempts.length) *
                                  100
                          )
                        : 0
            },

            moduleStatistics,

            recentAttempts: assessmentAttempts.slice(0, 20)
        });
    } catch (error) {
        console.error(
            "Get site officer assessments error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Server error while fetching site assessment data"
        });
    }
};
const getSiteOfficerCertifications = async (req, res) => {
    try {
        const officer = await User.findById(req.user._id).select("site");

        if (!officer) {
            return res.status(404).json({
                success: false,
                message: "Site officer not found"
            });
        }

        if (!officer.site) {
            return res.status(400).json({
                success: false,
                message: "Site officer is not assigned to a site"
            });
        }

        // Get only workers belonging to this officer's site
        const workers = await User.find({
            role: "worker",
            site: officer.site
        }).select("_id name email site");

        const workerIds = workers.map((worker) => worker._id);

        // Get certificates belonging only to those workers
        const certifications = await Certification.find({
            worker: { $in: workerIds }
        })
            .populate("worker", "name email site")
            .populate(
                "trainingAttempt",
                "moduleId scenarioScore passed"
            )
            .populate(
                "assessmentAttempt",
                "moduleId quizScore passed"
            )
            .sort({ createdAt: -1 });

        const verifiedCertificates = certifications.filter(
            (certificate) =>
                certificate.verificationStatus === "verified"
        );

        const pendingCertificates = certifications.filter(
            (certificate) =>
                certificate.verificationStatus === "pending"
        );

        const failedCertificates = certifications.filter(
            (certificate) =>
                certificate.verificationStatus === "failed"
        );

        const passedCertificates = certifications.filter(
            (certificate) => certificate.passed
        );

        const scores = certifications.map(
            (certificate) => certificate.finalScore
        );

        const averageFinalScore =
            scores.length > 0
                ? Math.round(
                      scores.reduce(
                          (sum, score) => sum + score,
                          0
                      ) / scores.length
                  )
                : 0;

        return res.json({
            success: true,

            site: officer.site,

            statistics: {
                totalCertificates: certifications.length,
                passedCertificates: passedCertificates.length,
                verifiedCertificates:
                    verifiedCertificates.length,
                pendingCertificates:
                    pendingCertificates.length,
                failedBlockchainCertificates:
                    failedCertificates.length,
                averageFinalScore
            },

            certificates: certifications
        });
    } catch (error) {
        console.error(
            "Get site officer certifications error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Server error while fetching site certification data"
        });
    }
};
const getSiteOfficerAnalytics = async (req, res) => {
    try {
        const officer = await User.findById(req.user._id).select("site");

        if (!officer) {
            return res.status(404).json({
                success: false,
                message: "Site officer not found"
            });
        }

        if (!officer.site) {
            return res.status(400).json({
                success: false,
                message: "Site officer is not assigned to a site"
            });
        }

        const workers = await User.find({
            role: "worker",
            site: officer.site
        }).select("_id active");

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

        const calculateAverage = (values) => {
            if (values.length === 0) {
                return 0;
            }

            return Math.round(
                values.reduce((sum, value) => sum + value, 0) /
                    values.length
            );
        };

        const scenarioScores = completedTraining.map(
            (attempt) => attempt.scenarioScore
        );

        const quizScores = assessmentAttempts.map(
            (attempt) => attempt.quizScore
        );

        const finalScores = certifications.map(
            (certificate) => certificate.finalScore
        );

        return res.json({
            success: true,

            site: officer.site,

            overview: {
                totalWorkers: workers.length,

                activeWorkers: workers.filter(
                    (worker) => worker.active
                ).length,

                totalTrainingAttempts:
                    trainingAttempts.length,

                completedTraining:
                    completedTraining.length,

                passedTraining:
                    passedTraining.length,

                trainingPassRate:
                    completedTraining.length > 0
                        ? Math.round(
                              (passedTraining.length /
                                  completedTraining.length) *
                                  100
                          )
                        : 0,

                totalAssessments:
                    assessmentAttempts.length,

                passedAssessments:
                    passedAssessments.length,

                assessmentPassRate:
                    assessmentAttempts.length > 0
                        ? Math.round(
                              (passedAssessments.length /
                                  assessmentAttempts.length) *
                                  100
                          )
                        : 0,

                totalCertificates:
                    certifications.length,

                verifiedCertificates:
                    verifiedCertificates.length,

                averageScenarioScore:
                    calculateAverage(scenarioScores),

                averageQuizScore:
                    calculateAverage(quizScores),

                averageFinalScore:
                    calculateAverage(finalScores)
            }
        });
    } catch (error) {
        console.error(
            "Get site officer analytics error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Server error while fetching site analytics"
        });
    }
};



module.exports = {
    getSiteOfficerDashboard,
    getSiteOfficerWorkers,
    getSiteOfficerWorkerDetails,
    getSiteOfficerTraining,
    getSiteOfficerAssessments,
    getSiteOfficerCertifications,
    getSiteOfficerAnalytics
   
};