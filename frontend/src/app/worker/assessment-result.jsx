
import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    Pressable,
    ActivityIndicator
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import {
    COLORS,
    SPACING,
    RADIUS
} from "../../constants/theme";

import {
    createCertification
} from "../../services/certificationService";

export default function AssessmentResultScreen() {
    const router = useRouter();

    const {
        moduleId,
        attemptId,
        assessmentAttemptId,
        quizScore,
        passed,
        correctAnswers,
        totalQuestions
    } = useLocalSearchParams();

    const score = Number(quizScore || 0);
    const isPassed = passed === "true";

    const [certification, setCertification] =
        useState(null);

    const [creatingCertificate, setCreatingCertificate] =
        useState(false);

    const [certificateError, setCertificateError] =
        useState("");

    useEffect(() => {
        if (
            isPassed &&
            attemptId &&
            assessmentAttemptId
        ) {
            createCertificate();
        }
    }, [
        isPassed,
        attemptId,
        assessmentAttemptId
    ]);

    const createCertificate = async () => {
        try {
            setCreatingCertificate(true);
            setCertificateError("");

            console.log(
                "[Certification] Creating certificate..."
            );

            console.log(
                "[Certification] Training Attempt:",
                attemptId
            );

            console.log(
                "[Certification] Assessment Attempt:",
                assessmentAttemptId
            );

            const data =
                await createCertification(
                    attemptId,
                    assessmentAttemptId
                );

            console.log(
                "[Certification] Backend response:",
                data
            );

            if (data?.success) {
                setCertification(
                    data.certification
                );
            } else {
                setCertificateError(
                    data?.message ||
                    "Unable to create certificate."
                );
            }
        } catch (error) {
            console.error(
                "[Certification] Failed:",
                error?.response?.data ||
                error
            );

            setCertificateError(
                error?.response?.data?.message ||
                "Unable to create certificate."
            );
        } finally {
            setCreatingCertificate(false);
        }
    };

    const handleContinue = () => {
        router.replace("/worker/dashboard");
    };

    const handleViewCertificate = () => {
        if (!certification) {
            return;
        }

        router.push({
            pathname: "/worker/certificate",
            params: {
                certificateId:
                    certification.certificateId,

                moduleId:
                    certification.moduleId,

                scenarioScore: String(
                    certification.scenarioScore
                ),

                quizScore: String(
                    certification.quizScore
                ),

                finalScore: String(
                    certification.finalScore
                ),

                verificationStatus:
                    certification.verificationStatus,

                blockchainTransactionId:
                    certification.blockchainTransactionId ||
                    ""
            }
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.header}>
                    <Text style={styles.title}>
                        Assessment Result
                    </Text>

                    <Text style={styles.subtitle}>
                        {moduleId ||
                            "Training Assessment"}
                    </Text>
                </View>

                <View
                    style={[
                        styles.resultCard,
                        isPassed
                            ? styles.successCard
                            : styles.failedCard
                    ]}
                >
                    <Text style={styles.resultIcon}>
                        {isPassed ? "✓" : "×"}
                    </Text>

                    <Text style={styles.resultTitle}>
                        {isPassed
                            ? "Assessment Passed"
                            : "Assessment Failed"}
                    </Text>

                    <Text style={styles.resultMessage}>
                        {isPassed
                            ? "You have successfully completed the assessment."
                            : "You did not meet the required assessment score."}
                    </Text>
                </View>

                <View style={styles.scoreCard}>
                    <Text style={styles.scoreLabel}>
                        Quiz Score
                    </Text>

                    <Text style={styles.score}>
                        {score}%
                    </Text>

                    <Text style={styles.passRequirement}>
                        Passing score: 70%
                    </Text>
                </View>

                <View style={styles.statsCard}>
                    <View style={styles.stat}>
                        <Text style={styles.statValue}>
                            {correctAnswers || 0}
                        </Text>

                        <Text style={styles.statLabel}>
                            Correct
                        </Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.stat}>
                        <Text style={styles.statValue}>
                            {totalQuestions || 0}
                        </Text>

                        <Text style={styles.statLabel}>
                            Questions
                        </Text>
                    </View>
                </View>

                {isPassed && (
                    <View style={styles.certificationCard}>
                        <Text style={styles.certificationTitle}>
                            Certification
                        </Text>

                        {creatingCertificate ? (
                            <>
                                <ActivityIndicator
                                    size="large"
                                    color={COLORS.secondary}
                                />

                                <Text
                                    style={
                                        styles.certificationText
                                    }
                                >
                                    Creating and verifying
                                    your certificate...
                                </Text>

                                <Text
                                    style={
                                        styles.blockchainText
                                    }
                                >
                                    Recording certificate
                                    integrity on blockchain
                                </Text>
                            </>
                        ) : certification ? (
                            <>
                                <Text
                                    style={
                                        styles.verifiedIcon
                                    }
                                >
                                    ✓
                                </Text>

                                <Text
                                    style={
                                        styles.verifiedTitle
                                    }
                                >
                                    Certificate Verified
                                </Text>

                                <Text
                                    style={
                                        styles.certificationText
                                    }
                                >
                                    Your certificate has been
                                    successfully recorded and
                                    verified.
                                </Text>

                                <View
                                    style={
                                        styles.certificateIdBox
                                    }
                                >
                                    <Text
                                        style={
                                            styles.certificateIdLabel
                                        }
                                    >
                                        Certificate ID
                                    </Text>

                                    <Text
                                        style={
                                            styles.certificateId
                                        }
                                    >
                                        {
                                            certification.certificateId
                                        }
                                    </Text>
                                </View>

                                <Pressable
                                    style={
                                        styles.certificateButton
                                    }
                                    onPress={
                                        handleViewCertificate
                                    }
                                >
                                    <Text
                                        style={
                                            styles.certificateButtonText
                                        }
                                    >
                                        View Certificate
                                    </Text>
                                </Pressable>
                            </>
                        ) : (
                            <>
                                <Text
                                    style={
                                        styles.errorTitle
                                    }
                                >
                                    Certificate Not Created
                                </Text>

                                <Text
                                    style={
                                        styles.errorText
                                    }
                                >
                                    {certificateError ||
                                        "Something went wrong while creating your certificate."}
                                </Text>

                                <Pressable
                                    style={
                                        styles.retryButton
                                    }
                                    onPress={
                                        createCertificate
                                    }
                                >
                                    <Text
                                        style={
                                            styles.retryButtonText
                                        }
                                    >
                                        Try Again
                                    </Text>
                                </Pressable>
                            </>
                        )}
                    </View>
                )}

                <Pressable
                    style={styles.button}
                    onPress={handleContinue}
                >
                    <Text style={styles.buttonText}>
                        Continue
                    </Text>
                </Pressable>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background
    },

    content: {
        padding: SPACING.lg,
        paddingBottom: SPACING.xl
    },

    header: {
        marginBottom: SPACING.lg
    },

    title: {
        color: COLORS.white,
        fontSize: 28,
        fontWeight: "800"
    },

    subtitle: {
        color: COLORS.textSecondary,
        fontSize: 14,
        marginTop: SPACING.xs
    },

    resultCard: {
        borderRadius: RADIUS.xl,
        padding: SPACING.xl,
        alignItems: "center",
        borderWidth: 1,
        marginBottom: SPACING.lg
    },

    successCard: {
        backgroundColor:
            "rgba(34, 197, 94, 0.12)",
        borderColor: COLORS.success
    },

    failedCard: {
        backgroundColor:
            "rgba(239, 68, 68, 0.12)",
        borderColor: COLORS.danger
    },

    resultIcon: {
        fontSize: 48,
        fontWeight: "900",
        color: COLORS.secondary,
        marginBottom: SPACING.sm
    },

    resultTitle: {
        color: COLORS.white,
        fontSize: 24,
        fontWeight: "800",
        textAlign: "center"
    },

    resultMessage: {
        color: COLORS.textSecondary,
        fontSize: 14,
        lineHeight: 21,
        textAlign: "center",
        marginTop: SPACING.sm
    },

    scoreCard: {
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.lg,
        padding: SPACING.xl,
        alignItems: "center",
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: SPACING.md
    },

    scoreLabel: {
        color: COLORS.textSecondary,
        fontSize: 14
    },

    score: {
        color: COLORS.secondary,
        fontSize: 52,
        fontWeight: "900",
        marginVertical: SPACING.sm
    },

    passRequirement: {
        color: COLORS.textSecondary,
        fontSize: 13
    },

    statsCard: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-around",
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.lg,
        paddingVertical: SPACING.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: SPACING.md
    },

    stat: {
        flex: 1,
        alignItems: "center"
    },

    statValue: {
        color: COLORS.white,
        fontSize: 24,
        fontWeight: "800"
    },

    statLabel: {
        color: COLORS.textSecondary,
        fontSize: 13,
        marginTop: SPACING.xs
    },

    divider: {
        width: 1,
        height: 40,
        backgroundColor: COLORS.border
    },

    certificationCard: {
        backgroundColor:
            "rgba(255, 215, 0, 0.08)",
        borderRadius: RADIUS.lg,
        padding: SPACING.lg,
        borderWidth: 1,
        borderColor: COLORS.secondary,
        alignItems: "center",
        marginBottom: SPACING.lg
    },

    certificationTitle: {
        color: COLORS.secondary,
        fontSize: 20,
        fontWeight: "800",
        marginBottom: SPACING.lg
    },

    certificationText: {
        color: COLORS.textSecondary,
        fontSize: 14,
        lineHeight: 21,
        textAlign: "center",
        marginTop: SPACING.md
    },

    blockchainText: {
        color: COLORS.textSecondary,
        fontSize: 12,
        textAlign: "center",
        marginTop: SPACING.sm
    },

    verifiedIcon: {
        color: COLORS.success,
        fontSize: 42,
        fontWeight: "900"
    },

    verifiedTitle: {
        color: COLORS.success,
        fontSize: 20,
        fontWeight: "800",
        marginTop: SPACING.sm
    },

    certificateIdBox: {
        width: "100%",
        backgroundColor: COLORS.background,
        borderRadius: RADIUS.md,
        padding: SPACING.md,
        marginTop: SPACING.lg
    },

    certificateIdLabel: {
        color: COLORS.textSecondary,
        fontSize: 12,
        marginBottom: SPACING.xs
    },

    certificateId: {
        color: COLORS.white,
        fontSize: 13,
        fontWeight: "700"
    },

    certificateButton: {
        width: "100%",
        backgroundColor: COLORS.secondary,
        borderRadius: RADIUS.md,
        paddingVertical: 14,
        alignItems: "center",
        marginTop: SPACING.lg
    },

    certificateButtonText: {
        color: "#041029",
        fontSize: 15,
        fontWeight: "800"
    },

    errorTitle: {
        color: COLORS.danger,
        fontSize: 18,
        fontWeight: "800"
    },

    errorText: {
        color: COLORS.textSecondary,
        textAlign: "center",
        fontSize: 14,
        lineHeight: 21,
        marginTop: SPACING.sm
    },

    retryButton: {
        backgroundColor: COLORS.danger,
        borderRadius: RADIUS.md,
        paddingVertical: 12,
        paddingHorizontal: 24,
        marginTop: SPACING.lg
    },

    retryButtonText: {
        color: COLORS.white,
        fontWeight: "800"
    },

    button: {
        backgroundColor: COLORS.secondary,
        borderRadius: RADIUS.lg,
        paddingVertical: 16,
        alignItems: "center"
    },

    buttonText: {
        color: "#041029",
        fontSize: 16,
        fontWeight: "800"
    }
});

