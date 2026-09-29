const crypto = require("crypto");

const TrainingAttempt = require("../models/TrainingAttempt");
const AssessmentAttempt = require("../models/AssessmentAttempt");
const Certification = require("../models/Certification");

const {
    issueCertificateOnBlockchain,
    verifyCertificateOnBlockchain
} = require("../services/blockchainService");

const generateCertificateId = () => {
    return `SIH-${Date.now()}-${crypto
        .randomBytes(4)
        .toString("hex")
        .toUpperCase()}`;
};

const generateCertificateHash = ({
    certificateId,
    workerId,
    moduleId,
    finalScore,
    issuedAt
}) => {
    const certificateData = [
        certificateId,
        workerId,
        moduleId,
        finalScore,
        issuedAt.toISOString()
    ].join("|");

    return crypto
        .createHash("sha256")
        .update(certificateData)
        .digest("hex");
};

const createCertification = async (req, res) => {
    try {
        const {
            trainingAttemptId,
            assessmentAttemptId
        } = req.body;

        if (!trainingAttemptId || !assessmentAttemptId) {
            return res.status(400).json({
                success: false,
                message:
                    "trainingAttemptId and assessmentAttemptId are required"
            });
        }

        const trainingAttempt =
            await TrainingAttempt.findById(trainingAttemptId);

        if (!trainingAttempt) {
            return res.status(404).json({
                success: false,
                message: "Training attempt not found"
            });
        }

        const assessmentAttempt =
            await AssessmentAttempt.findById(assessmentAttemptId);

        if (!assessmentAttempt) {
            return res.status(404).json({
                success: false,
                message: "Assessment attempt not found"
            });
        }

        // Make sure both attempts belong to the logged-in worker.
        if (
            trainingAttempt.worker.toString() !==
            req.user._id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message: "You cannot use this training attempt"
            });
        }

        if (
            assessmentAttempt.worker.toString() !==
            req.user._id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message: "You cannot use this assessment attempt"
            });
        }

        // Make sure the assessment belongs to this training attempt.
        if (
            assessmentAttempt.trainingAttempt.toString() !==
            trainingAttempt._id.toString()
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Training and assessment attempts do not match"
            });
        }

        const scenarioScore =
            trainingAttempt.scenarioScore;

        const quizScore =
            assessmentAttempt.quizScore;

        const finalScore = Math.round(
            scenarioScore * 0.60 +
            quizScore * 0.40
        );

        const passed =
            trainingAttempt.passed &&
            assessmentAttempt.passed &&
            finalScore >= 70;

        // If the worker did not pass, no blockchain certificate
        // should be created.
        if (!passed) {
            const certification =
                await Certification.create({
                    worker: req.user._id,

                    trainingAttempt:
                        trainingAttempt._id,

                    assessmentAttempt:
                        assessmentAttempt._id,

                    moduleId:
                        trainingAttempt.moduleId,

                    scenarioScore,
                    quizScore,
                    finalScore,

                    passed: false,

                    verificationStatus: "not_issued"
                });

            return res.status(201).json({
                success: true,

                message:
                    "Certification completed - worker did not pass",

                certification: {
                    id: certification._id,
                    moduleId: certification.moduleId,
                    scenarioScore,
                    quizScore,
                    finalScore,
                    passed: false,
                    certificateId: null,
                    certificateHash: null,
                    verificationStatus:
                        certification.verificationStatus,
                    issuedAt: null
                }
            });
        }

        // Worker passed, so generate the certificate.
        const certificateId =
            generateCertificateId();

        const issuedAt = new Date();

        const certificateHash =
            generateCertificateHash({
                certificateId,
                workerId: req.user._id.toString(),
                moduleId: trainingAttempt.moduleId,
                finalScore,
                issuedAt
            });

        // First save the certificate in MongoDB as pending.
        const certification =
            await Certification.create({
                worker: req.user._id,

                trainingAttempt:
                    trainingAttempt._id,

                assessmentAttempt:
                    assessmentAttempt._id,

                moduleId:
                    trainingAttempt.moduleId,

                scenarioScore,
                quizScore,
                finalScore,

                passed: true,

                certificateId,
                certificateHash,

                verificationStatus: "pending",

                issuedAt
            });

        try {
            // Write the certificate hash and metadata
            // to the real blockchain.
            const blockchainResult =
                await issueCertificateOnBlockchain({
                    certificateId,
                    certificateHash,
                    moduleId: trainingAttempt.moduleId,
                    finalScore
                });

            // Blockchain transaction succeeded.
            certification.blockchainTransactionId =
                blockchainResult.transactionId;

            certification.blockchainNetwork =
                "hardhat-local";

            certification.blockchainTimestamp =
                new Date();

            certification.verificationStatus =
                "verified";

            await certification.save();

            return res.status(201).json({
                success: true,

                message:
                    "Certification completed and certificate verified on blockchain",

                certification: {
                    id: certification._id,
                    moduleId: certification.moduleId,
                    scenarioScore,
                    quizScore,
                    finalScore,
                    passed: true,

                    certificateId,
                    certificateHash,

                    verificationStatus:
                        certification.verificationStatus,

                    blockchainTransactionId:
                        certification.blockchainTransactionId,

                    blockchainNetwork:
                        certification.blockchainNetwork,

                    blockchainTimestamp:
                        certification.blockchainTimestamp,

                    issuedAt
                }
            });
        } catch (blockchainError) {
            console.error(
                "Blockchain certificate issuance failed:",
                blockchainError
            );

            certification.verificationStatus =
                "failed";

            await certification.save();

            return res.status(502).json({
                success: false,

                message:
                    "Certificate was created, but blockchain issuance failed",

                certification: {
                    id: certification._id,
                    certificateId,
                    certificateHash,
                    verificationStatus:
                        certification.verificationStatus
                }
            });
        }
    } catch (error) {
        console.error(
            "Create certification error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Server error while creating certification"
        });
    }
};

const verifyCertification = async (req, res) => {
    try {
        const { certificateId } = req.params;

        if (!certificateId) {
            return res.status(400).json({
                success: false,
                message: "Certificate ID is required"
            });
        }

        const certification =
            await Certification.findOne({
                certificateId
            });

        if (!certification) {
            return res.status(404).json({
                success: false,
                message: "Certificate not found"
            });
        }

        if (!certification.certificateHash) {
            return res.status(400).json({
                success: false,
                message:
                    "Certificate does not have a blockchain hash"
            });
        }

        // Read the certificate directly from blockchain.
        const blockchainCertificate =
            await verifyCertificateOnBlockchain(
                certificateId
            );

        // Certificate does not exist on blockchain.
        if (!blockchainCertificate.exists) {
            return res.status(404).json({
                success: false,
                message:
                    "Certificate was not found on blockchain",
                verificationStatus: "not_found"
            });
        }

        // Compare MongoDB hash with blockchain hash.
        const hashMatches =
            blockchainCertificate.certificateHash ===
            certification.certificateHash;

        // Also verify important metadata.
        const moduleMatches =
            blockchainCertificate.moduleId ===
            certification.moduleId;

        const scoreMatches =
            blockchainCertificate.finalScore ===
            certification.finalScore;

        const verified =
            hashMatches &&
            moduleMatches &&
            scoreMatches;

        return res.json({
            success: true,
            verified,

            certificate: {
                certificateId:
                    certification.certificateId,

                moduleId:
                    certification.moduleId,

                scenarioScore:
                    certification.scenarioScore,

                quizScore:
                    certification.quizScore,

                finalScore:
                    certification.finalScore,

                passed:
                    certification.passed,

                certificateHash:
                    certification.certificateHash,

                blockchainTransactionId:
                    certification.blockchainTransactionId,

                blockchainNetwork:
                    certification.blockchainNetwork,

                blockchainTimestamp:
                    certification.blockchainTimestamp,

                issuedAt:
                    certification.issuedAt
            },

            blockchain: {
                exists:
                    blockchainCertificate.exists,

                certificateHash:
                    blockchainCertificate.certificateHash,

                moduleId:
                    blockchainCertificate.moduleId,

                finalScore:
                    blockchainCertificate.finalScore,

                timestamp:
                    blockchainCertificate.timestamp
            },

            checks: {
                hashMatches,
                moduleMatches,
                scoreMatches
            }
        });

    } catch (error) {
        console.error(
            "Verify certification error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Server error while verifying certificate"
        });
    }
};

module.exports = {
    createCertification,
    verifyCertification
};