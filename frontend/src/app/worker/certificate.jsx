import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    Pressable,
    ActivityIndicator,
    Alert
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import QRCode from "react-native-qrcode-svg";


import {
    COLORS,
    SPACING,
    RADIUS
} from "../../constants/theme";

import {
    verifyCertification
} from "../../services/certificationService";

export default function CertificateScreen() {
    const router = useRouter();

    const {
        certificateId,
        moduleId,
        scenarioScore,
        quizScore,
        finalScore,
        verificationStatus,
        blockchainTransactionId
    } = useLocalSearchParams();

    const [verifying, setVerifying] = useState(false);
    const [verificationResult, setVerificationResult] =
        useState(null);

    const verificationUrl =
    `sih26041app://verify-certificate?certificateId=${encodeURIComponent(
        certificateId || ""
    )}`;

    const handleVerify = async () => {
        if (!certificateId) {
            Alert.alert(
                "Verification Error",
                "Certificate ID is missing."
            );
            return;
        }

        try {
            setVerifying(true);

            console.log(
                "[Certificate] Verifying certificate:",
                certificateId
            );

            const data =
                await verifyCertification(
                    certificateId
                );

            console.log(
                "[Certificate] Verification response:",
                data
            );

            setVerificationResult(data);
        } catch (error) {
            console.error(
                "[Certificate] Verification failed:",
                error?.response?.data || error
            );

            Alert.alert(
                "Verification Failed",
                error?.response?.data?.message ||
                    "Unable to verify certificate."
            );
        } finally {
            setVerifying(false);
        }
    };

    const isVerified =
        verificationResult?.verified ??
        verificationStatus === "verified";

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}

                <View style={styles.header}>
                    <Text style={styles.title}>
                        Safety Certificate
                    </Text>

                    <Text style={styles.subtitle}>
                        SIH 26041 Worker Certification
                    </Text>
                </View>

                {/* Certificate */}

                <View style={styles.certificate}>
                    <View style={styles.certificateTop}>
                        <Text style={styles.brand}>
                            SIH 26041
                        </Text>

                        <Text style={styles.certificateLabel}>
                            SAFETY TRAINING CERTIFICATE
                        </Text>
                    </View>

                    <View style={styles.divider} />

                    <Text style={styles.certifiedText}>
                        This certificate confirms successful
                        completion of the required safety
                        training and assessment.
                    </Text>

                    {/* Module */}

                    <View style={styles.infoSection}>
                        <Text style={styles.infoLabel}>
                            TRAINING MODULE
                        </Text>

                        <Text style={styles.infoValue}>
                            {moduleId ||
                                "Safety Training"}
                        </Text>
                    </View>

                    {/* Scores */}

                    <View style={styles.scoreRow}>
                        <View style={styles.scoreItem}>
                            <Text style={styles.scoreLabel}>
                                Scenario
                            </Text>

                            <Text style={styles.scoreValue}>
                                {scenarioScore || 0}%
                            </Text>
                        </View>

                        <View style={styles.scoreItem}>
                            <Text style={styles.scoreLabel}>
                                Assessment
                            </Text>

                            <Text style={styles.scoreValue}>
                                {quizScore || 0}%
                            </Text>
                        </View>

                        <View style={styles.scoreItem}>
                            <Text style={styles.scoreLabel}>
                                Final
                            </Text>

                            <Text style={styles.finalScoreValue}>
                                {finalScore || 0}%
                            </Text>
                        </View>
                    </View>

                    {/* Certificate ID */}

                    <View style={styles.infoSection}>
                        <Text style={styles.infoLabel}>
                            CERTIFICATE ID
                        </Text>

                        <Text style={styles.certificateId}>
                            {certificateId ||
                                "Not available"}
                        </Text>
                    </View>


                    {/* QR Code */}

<View style={styles.qrSection}>
    <Text style={styles.qrTitle}>
        Certificate Verification
    </Text>

    <Text style={styles.qrDescription}>
        Scan this QR code to verify this certificate.
    </Text>

    {certificateId ? (
        <View style={styles.qrContainer}>
            <QRCode
                value={verificationUrl}
                size={180}
                backgroundColor="#FFFFFF"
                color="#041029"
            />
        </View>
    ) : (
        <Text style={styles.qrUnavailable}>
            QR code unavailable
        </Text>
    )}

    <Text style={styles.qrHint}>
        Scan with the SIH 26041 app
    </Text>
</View>

                    {/* Blockchain */}

                    <View style={styles.blockchainBadge}>
                        <Text style={styles.blockchainIcon}>
                            ✓
                        </Text>

                        <View style={styles.blockchainContent}>
                            <Text
                                style={
                                    styles.blockchainTitle
                                }
                            >
                                Blockchain Verified
                            </Text>

                            <Text
                                style={
                                    styles.blockchainDescription
                                }
                            >
                                Certificate integrity is
                                recorded on the blockchain.
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Verification status */}

                <View style={styles.verificationCard}>
                    <Text style={styles.sectionTitle}>
                        Verification Status
                    </Text>

                    <View style={styles.statusRow}>
                        <View
                            style={[
                                styles.statusDot,
                                isVerified
                                    ? styles.verifiedDot
                                    : styles.pendingDot
                            ]}
                        />

                        <Text
                            style={[
                                styles.statusText,
                                isVerified
                                    ? styles.verifiedText
                                    : styles.pendingText
                            ]}
                        >
                            {isVerified
                                ? "Certificate Verified"
                                : "Verification Pending"}
                        </Text>
                    </View>

                    <Pressable
                        style={styles.verifyButton}
                        onPress={handleVerify}
                        disabled={verifying}
                    >
                        {verifying ? (
                            <ActivityIndicator
                                color="#041029"
                            />
                        ) : (
                            <Text
                                style={
                                    styles.verifyButtonText
                                }
                            >
                                Verify on Blockchain
                            </Text>
                        )}
                    </Pressable>

                    {verificationResult && (
                        <View style={styles.checksBox}>
                            <Text style={styles.checksTitle}>
                                Verification Checks
                            </Text>

                            <VerificationCheck
                                label="Certificate hash"
                                passed={
                                    verificationResult
                                        .checks
                                        ?.hashMatches
                                }
                            />

                            <VerificationCheck
                                label="Module information"
                                passed={
                                    verificationResult
                                        .checks
                                        ?.moduleMatches
                                }
                            />

                            <VerificationCheck
                                label="Final score"
                                passed={
                                    verificationResult
                                        .checks
                                        ?.scoreMatches
                                }
                            />
                        </View>
                    )}
                </View>
              {/* Public Certificate Verification */}

<Pressable
    style={styles.publicVerifyButton}
    onPress={() =>
        router.push({
            pathname: "/verify-certificate",
            params: {
                certificateId: certificateId
            }
        })
    }
>
    <Text style={styles.publicVerifyButtonText}>
        🔍 Verify Certificate
    </Text>
</Pressable>
                {/* Blockchain transaction */}

                {blockchainTransactionId && (
                    <View style={styles.transactionCard}>
                        <Text style={styles.sectionTitle}>
                            Blockchain Transaction
                        </Text>

                        <Text
                            style={
                                styles.transactionLabel
                            }
                        >
                            Transaction ID
                        </Text>

                        <Text
                            style={
                                styles.transactionValue
                            }
                        >
                            {blockchainTransactionId}
                        </Text>

                        <Text
                            style={
                                styles.networkText
                            }
                        >
                            Network: Hardhat Local
                        </Text>
                    </View>
                )}

                {/* Back */}

                <Pressable
                    style={styles.backButton}
                    onPress={() =>
                        router.replace(
                            "/worker/dashboard"
                        )
                    }
                >
                    <Text style={styles.backButtonText}>
                        Back to Dashboard
                    </Text>
                </Pressable>
            </ScrollView>
        </SafeAreaView>
    );
}

function VerificationCheck({
    label,
    passed
}) {
    return (
        <View style={styles.checkRow}>
            <Text
                style={[
                    styles.checkIcon,
                    passed
                        ? styles.checkPassed
                        : styles.checkFailed
                ]}
            >
                {passed ? "✓" : "×"}
            </Text>

            <Text style={styles.checkLabel}>
                {label}
            </Text>
        </View>
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

    certificate: {
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.xl,
        padding: SPACING.lg,
        borderWidth: 1,
        borderColor: COLORS.secondary,
        marginBottom: SPACING.lg
    },

    certificateTop: {
        alignItems: "center"
    },

    brand: {
        color: COLORS.secondary,
        fontSize: 25,
        fontWeight: "900",
        letterSpacing: 2
    },

    certificateLabel: {
        color: COLORS.white,
        fontSize: 13,
        fontWeight: "800",
        letterSpacing: 1.5,
        marginTop: SPACING.sm,
        textAlign: "center"
    },

    divider: {
        height: 1,
        backgroundColor: COLORS.border,
        marginVertical: SPACING.lg
    },

    certifiedText: {
        color: COLORS.textSecondary,
        fontSize: 13,
        lineHeight: 20,
        textAlign: "center"
    },

    infoSection: {
        marginTop: SPACING.lg
    },

    infoLabel: {
        color: COLORS.textSecondary,
        fontSize: 10,
        fontWeight: "700",
        letterSpacing: 1
    },

    infoValue: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: "700",
        marginTop: SPACING.xs
    },

    certificateId: {
        color: COLORS.secondary,
        fontSize: 12,
        fontWeight: "700",
        marginTop: SPACING.xs
    },

    scoreRow: {
        flexDirection: "row",
        marginTop: SPACING.lg,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: COLORS.border,
        paddingVertical: SPACING.md
    },

    scoreItem: {
        flex: 1,
        alignItems: "center"
    },

    scoreLabel: {
        color: COLORS.textSecondary,
        fontSize: 11
    },

    scoreValue: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: "800",
        marginTop: SPACING.xs
    },

    finalScoreValue: {
        color: COLORS.secondary,
        fontSize: 18,
        fontWeight: "900",
        marginTop: SPACING.xs
    },

    blockchainBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor:
            "rgba(34, 197, 94, 0.10)",
        borderRadius: RADIUS.md,
        padding: SPACING.md,
        marginTop: SPACING.lg,
        borderWidth: 1,
        borderColor: COLORS.success
    },

    blockchainIcon: {
        color: COLORS.success,
        fontSize: 25,
        fontWeight: "900",
        marginRight: SPACING.md
    },

    blockchainContent: {
        flex: 1
    },

    blockchainTitle: {
        color: COLORS.success,
        fontSize: 14,
        fontWeight: "800"
    },

    blockchainDescription: {
        color: COLORS.textSecondary,
        fontSize: 12,
        lineHeight: 18,
        marginTop: 2
    },

    verificationCard: {
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.lg,
        padding: SPACING.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: SPACING.md
    },

    sectionTitle: {
        color: COLORS.white,
        fontSize: 17,
        fontWeight: "800",
        marginBottom: SPACING.md
    },

    statusRow: {
        flexDirection: "row",
        alignItems: "center"
    },

    statusDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: SPACING.sm
    },

    verifiedDot: {
        backgroundColor: COLORS.success
    },

    pendingDot: {
        backgroundColor: COLORS.warning
    },

    statusText: {
        fontSize: 14,
        fontWeight: "700"
    },

    verifiedText: {
        color: COLORS.success
    },

    pendingText: {
        color: COLORS.warning
    },

    verifyButton: {
        backgroundColor: COLORS.secondary,
        borderRadius: RADIUS.md,
        paddingVertical: 14,
        alignItems: "center",
        marginTop: SPACING.lg
    },

    verifyButtonText: {
        color: "#041029",
        fontSize: 14,
        fontWeight: "800"
    },

    checksBox: {
        marginTop: SPACING.lg,
        paddingTop: SPACING.md,
        borderTopWidth: 1,
        borderTopColor: COLORS.border
    },

    checksTitle: {
        color: COLORS.white,
        fontSize: 14,
        fontWeight: "700",
        marginBottom: SPACING.sm
    },

    checkRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: SPACING.sm
    },

    checkIcon: {
        fontSize: 17,
        fontWeight: "900",
        width: 25
    },

    checkPassed: {
        color: COLORS.success
    },

    checkFailed: {
        color: COLORS.danger
    },

    checkLabel: {
        color: COLORS.textSecondary,
        fontSize: 13
    },

    transactionCard: {
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.lg,
        padding: SPACING.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: SPACING.md
    },

    transactionLabel: {
        color: COLORS.textSecondary,
        fontSize: 11,
        marginBottom: SPACING.xs
    },
    qrSection: {
    marginTop: SPACING.lg,
    alignItems: "center",
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border
},

qrTitle: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "800"
},

qrDescription: {
    color: COLORS.textSecondary,
    fontSize: 12,
    textAlign: "center",
    marginTop: SPACING.xs,
    marginBottom: SPACING.md
},

qrContainer: {
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: RADIUS.md,
    alignItems: "center",
    justifyContent: "center"
},

qrUnavailable: {
    color: COLORS.warning,
    fontSize: 12,
    marginTop: SPACING.sm
},

qrHint: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: SPACING.sm
},

    transactionValue: {
        color: COLORS.white,
        fontSize: 11,
        lineHeight: 17
    },

    networkText: {
        color: COLORS.secondary,
        fontSize: 12,
        marginTop: SPACING.sm
    },

    backButton: {
        backgroundColor: COLORS.secondary,
        borderRadius: RADIUS.lg,
        paddingVertical: 16,
        alignItems: "center",
        marginTop: SPACING.sm
    },

    backButtonText: {
        color: "#041029",
        fontSize: 15,
        fontWeight: "800"
    },
    publicVerifyButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: COLORS.secondary,
    borderRadius: RADIUS.lg,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: SPACING.md
},

publicVerifyButtonText: {
    color: COLORS.secondary,
    fontSize: 14,
    fontWeight: "800"
}
});

