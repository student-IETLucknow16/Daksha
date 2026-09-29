import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View
} from "react-native";

import {
    CameraView,
    useCameraPermissions
} from "expo-camera";

import { useLocalSearchParams, useRouter } from "expo-router";

import { COLORS, SPACING, RADIUS } from "../constants/theme";
import { verifyCertificate } from "../services/certificationService";

export default function VerifyCertificateScreen() {
    const router = useRouter();

    const {
        certificateId: initialCertificateId
    } = useLocalSearchParams();

    const [certificateId, setCertificateId] = useState(
        initialCertificateId || ""
    );

    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState("");

    // QR Scanner state
    const [permission, requestPermission] =
        useCameraPermissions();

    const [scannerVisible, setScannerVisible] =
        useState(false);

    const [scanned, setScanned] =
        useState(false);

    useEffect(() => {
        if (initialCertificateId) {
            setCertificateId(initialCertificateId);

            // Automatically verify when opened
            // with a certificate ID from the QR/deep link.
            handleVerify(initialCertificateId);
        }
    }, [initialCertificateId]);

    const handleVerify = async (
        certificateIdToVerify = certificateId
    ) => {
        const trimmedId =
            certificateIdToVerify.trim();

        if (!trimmedId) {
            setError(
                "Please enter a certificate ID."
            );
            setResult(null);
            return;
        }

        try {
            setLoading(true);
            setError("");
            setResult(null);

            console.log(
                "[VerifyCertificate] Verifying:",
                trimmedId
            );

            const data =
                await verifyCertificate(trimmedId);

            console.log(
                "[VerifyCertificate] Response:",
                data
            );

            setResult(data);
        } catch (err) {
            console.error(
                "[VerifyCertificate] Verification error:",
                err?.response?.data || err
            );

            setError(
                err?.response?.data?.message ||
                    "Unable to verify certificate."
            );
        } finally {
            setLoading(false);
        }
    };

    // --------------------------------------------------
    // QR SCANNER
    // --------------------------------------------------

    const handleBarcodeScanned = ({ data }) => {
        if (scanned) return;

        console.log(
            "[QRScanner] Scanned data:",
            data
        );

        setScanned(true);
        setScannerVisible(false);

        try {
            const parsed = new URL(data);

            /*
             * Expected QR format:
             *
             * sih26041app://verify-certificate
             * ?certificateId=SIH-XXXXXXXX
             */

            if (
                parsed.protocol ===
                "sih26041app:"
            ) {
                const scannedCertificateId =
                    parsed.searchParams.get(
                        "certificateId"
                    );

                if (scannedCertificateId) {
                    console.log(
                        "[QRScanner] Certificate ID:",
                        scannedCertificateId
                    );

                    setCertificateId(
                        scannedCertificateId
                    );

                    setError("");

                    handleVerify(
                        scannedCertificateId
                    );

                    return;
                }
            }

            setError(
                "This QR code is not a valid SIH 26041 certificate."
            );
        } catch (scanError) {
            console.error(
                "[QRScanner] Invalid QR data:",
                scanError
            );

            setError(
                "Invalid QR code. Please scan a SIH 26041 certificate."
            );
        } finally {
            setScanned(false);
        }
    };

    const openScanner = async () => {
        setError("");
        setResult(null);

        if (!permission?.granted) {
            const permissionResult =
                await requestPermission();

            if (!permissionResult.granted) {
                setError(
                    "Camera permission is required to scan QR codes."
                );

                return;
            }
        }

        setScanned(false);
        setScannerVisible(true);
    };

    const closeScanner = () => {
        setScannerVisible(false);
        setScanned(false);
    };

    const formatModuleName = (moduleId) => {
        if (!moduleId) return "—";

        return moduleId
            .split("_")
            .map(
                (word) =>
                    word.charAt(0).toUpperCase() +
                    word.slice(1)
            )
            .join(" ");
    };

    const formatDate = (date) => {
        if (!date) return "—";

        try {
            return new Date(date).toLocaleString();
        } catch {
            return date;
        }
    };

    const VerificationCheck = ({
        label,
        value
    }) => (
        <View style={styles.checkRow}>
            <Text style={styles.checkLabel}>
                {label}
            </Text>

            <Text
                style={[
                    styles.checkValue,
                    value
                        ? styles.checkSuccess
                        : styles.checkFailed
                ]}
            >
                {value
                    ? "✓ Match"
                    : "✕ Failed"}
            </Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <ScrollView
                contentContainerStyle={
                    styles.content
                }
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}

                <View style={styles.header}>
                    <Pressable
                        style={styles.backButton}
                        onPress={() =>
                            router.back()
                        }
                    >
                        <Text style={styles.backText}>
                            ←
                        </Text>
                    </Pressable>

                    <View
                        style={
                            styles.headerTextContainer
                        }
                    >
                        <Text
                            style={
                                styles.headerTitle
                            }
                        >
                            Certificate Verification
                        </Text>

                        <Text
                            style={
                                styles.headerSubtitle
                            }
                        >
                            Verify certificate authenticity
                        </Text>
                    </View>
                </View>

                {/* Intro */}

                <View style={styles.introCard}>
                    <View style={styles.introIcon}>
                        <Text
                            style={
                                styles.introIconText
                            }
                        >
                            ✓
                        </Text>
                    </View>

                    <View
                        style={
                            styles.introContent
                        }
                    >
                        <Text
                            style={
                                styles.introTitle
                            }
                        >
                            Verify a Certificate
                        </Text>

                        <Text
                            style={
                                styles.introText
                            }
                        >
                            Enter the certificate ID
                            or scan the QR code to
                            check its authenticity
                            against the blockchain
                            record.
                        </Text>
                    </View>
                </View>

                {/* Certificate ID */}

                <Text
                    style={styles.sectionTitle}
                >
                    Certificate ID
                </Text>

                <TextInput
                    value={certificateId}
                    onChangeText={(value) => {
                        setCertificateId(value);
                        setError("");
                        setResult(null);
                    }}
                    placeholder="e.g. SIH-1750000000000-A1B2C3D4"
                    placeholderTextColor={
                        COLORS.textSecondary
                    }
                    autoCapitalize="characters"
                    autoCorrect={false}
                    style={styles.input}
                />

                {/* QR Scanner Button */}

                <Pressable
                    style={styles.scanButton}
                    onPress={openScanner}
                    disabled={loading}
                >
                    <Text
                        style={
                            styles.scanButtonIcon
                        }
                    >
                        📷
                    </Text>

                    <Text
                        style={
                            styles.scanButtonText
                        }
                    >
                        Scan QR Code
                    </Text>
                </Pressable>

                {/* QR Scanner */}

                {scannerVisible && (
                    <View
                        style={
                            styles.scannerContainer
                        }
                    >
                        <CameraView
                            style={styles.camera}
                            facing="back"
                            barcodeScannerSettings={{
                                barcodeTypes: [
                                    "qr"
                                ]
                            }}
                            onBarcodeScanned={
                                scanned
                                    ? undefined
                                    : handleBarcodeScanned
                            }
                        />

                        {/* Scanner Overlay */}

                        <View
                            style={
                                styles.scannerOverlay
                            }
                        >
                            <View
                                style={
                                    styles.scanFrame
                                }
                            />

                            <Text
                                style={
                                    styles.scannerText
                                }
                            >
                                Align the certificate
                                QR code inside the
                                frame
                            </Text>
                        </View>

                        {/* Close Scanner */}

                        <Pressable
                            style={
                                styles.closeScannerButton
                            }
                            onPress={
                                closeScanner
                            }
                        >
                            <Text
                                style={
                                    styles.closeScannerText
                                }
                            >
                                Close Scanner
                            </Text>
                        </Pressable>
                    </View>
                )}

                {/* Verify Button */}

                <Pressable
                    style={[
                        styles.verifyButton,
                        loading &&
                            styles.verifyButtonDisabled
                    ]}
                    onPress={() =>
                        handleVerify()
                    }
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator
                            size="small"
                            color={
                                COLORS.background
                            }
                        />
                    ) : (
                        <Text
                            style={
                                styles.verifyIcon
                            }
                        >
                            🔍
                        </Text>
                    )}

                    <Text
                        style={
                            styles.verifyButtonText
                        }
                    >
                        {loading
                            ? "Verifying..."
                            : "Verify Certificate"}
                    </Text>
                </Pressable>

                {/* Error */}

                {error ? (
                    <View
                        style={
                            styles.errorCard
                        }
                    >
                        <Text
                            style={
                                styles.errorIcon
                            }
                        >
                            !
                        </Text>

                        <Text
                            style={
                                styles.errorText
                            }
                        >
                            {error}
                        </Text>
                    </View>
                ) : null}

                {/* Result */}

                {result ? (
                    <View
                        style={
                            styles.resultContainer
                        }
                    >
                        {/* Verification Status */}

                        <View
                            style={[
                                styles.statusCard,
                                result.verified
                                    ? styles.statusVerified
                                    : styles.statusInvalid
                            ]}
                        >
                            <View
                                style={[
                                    styles.statusIcon,
                                    result.verified
                                        ? styles.statusIconVerified
                                        : styles.statusIconInvalid
                                ]}
                            >
                                <Text
                                    style={
                                        styles.statusIconText
                                    }
                                >
                                    {result.verified
                                        ? "✓"
                                        : "✕"}
                                </Text>
                            </View>

                            <Text
                                style={
                                    styles.statusTitle
                                }
                            >
                                {result.verified
                                    ? "Certificate Verified"
                                    : "Certificate Verification Failed"}
                            </Text>

                            <Text
                                style={
                                    styles.statusDescription
                                }
                            >
                                {result.verified
                                    ? "The certificate data matches the blockchain record."
                                    : "The certificate could not be fully verified against the blockchain record."}
                            </Text>
                        </View>

                        {/* Certificate Details */}

                        {result.certificate ? (
                            <>
                                <Text
                                    style={
                                        styles.sectionTitle
                                    }
                                >
                                    Certificate Details
                                </Text>

                                <View
                                    style={
                                        styles.card
                                    }
                                >
                                    <InfoRow
                                        label="Certificate ID"
                                        value={
                                            result
                                                .certificate
                                                .certificateId
                                        }
                                    />

                                    <InfoRow
                                        label="Training Module"
                                        value={formatModuleName(
                                            result
                                                .certificate
                                                .moduleId
                                        )}
                                    />

                                    <InfoRow
                                        label="Scenario Score"
                                        value={`${result.certificate.scenarioScore}%`}
                                    />

                                    <InfoRow
                                        label="Assessment Score"
                                        value={`${result.certificate.quizScore}%`}
                                    />

                                    <InfoRow
                                        label="Final Score"
                                        value={`${result.certificate.finalScore}%`}
                                        highlight
                                    />

                                    <InfoRow
                                        label="Passed"
                                        value={
                                            result
                                                .certificate
                                                .passed
                                                ? "Yes"
                                                : "No"
                                        }
                                    />

                                    <InfoRow
                                        label="Issued On"
                                        value={formatDate(
                                            result
                                                .certificate
                                                .issuedAt
                                        )}
                                        last
                                    />
                                </View>
                            </>
                        ) : null}

                        {/* Blockchain Verification */}

                        {result.blockchain ? (
                            <>
                                <Text
                                    style={
                                        styles.sectionTitle
                                    }
                                >
                                    Blockchain Verification
                                </Text>

                                <View
                                    style={
                                        styles.card
                                    }
                                >
                                    <VerificationCheck
                                        label="Certificate Hash"
                                        value={
                                            result
                                                .checks
                                                ?.hashMatches
                                        }
                                    />

                                    <VerificationCheck
                                        label="Training Module"
                                        value={
                                            result
                                                .checks
                                                ?.moduleMatches
                                        }
                                    />

                                    <VerificationCheck
                                        label="Final Score"
                                        value={
                                            result
                                                .checks
                                                ?.scoreMatches
                                        }
                                    />
                                </View>

                                <View
                                    style={
                                        styles.blockchainCard
                                    }
                                >
                                    <Text
                                        style={
                                            styles.blockchainTitle
                                        }
                                    >
                                        ⛓ Blockchain Record
                                    </Text>

                                    <InfoRow
                                        label="Network"
                                        value={
                                            result
                                                .certificate
                                                ?.blockchainNetwork ||
                                            "—"
                                        }
                                    />

                                    <InfoRow
                                        label="Transaction ID"
                                        value={
                                            result
                                                .certificate
                                                ?.blockchainTransactionId ||
                                            "—"
                                        }
                                    />

                                    <InfoRow
                                        label="Blockchain Time"
                                        value={formatDate(
                                            result
                                                .blockchain
                                                .timestamp
                                        )}
                                        last
                                    />
                                </View>
                            </>
                        ) : null}
                    </View>
                ) : null}
            </ScrollView>
        </View>
    );
}

function InfoRow({
    label,
    value,
    highlight = false,
    last = false
}) {
    return (
        <View
            style={[
                styles.infoRow,
                !last &&
                    styles.infoRowBorder
            ]}
        >
            <Text style={styles.infoLabel}>
                {label}
            </Text>

            <Text
                style={[
                    styles.infoValue,
                    highlight &&
                        styles.highlightValue
                ]}
            >
                {value || "—"}
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
        paddingBottom: SPACING.xl * 2
    },

    header: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: SPACING.lg
    },

    backButton: {
        width: 44,
        height: 44,
        borderRadius: RADIUS.md,
        backgroundColor: COLORS.surface,
        justifyContent: "center",
        alignItems: "center",
        marginRight: SPACING.md
    },

    backText: {
        color: COLORS.white,
        fontSize: 26
    },

    headerTextContainer: {
        flex: 1
    },

    headerTitle: {
        color: COLORS.white,
        fontSize: 22,
        fontWeight: "700"
    },

    headerSubtitle: {
        color: COLORS.textSecondary,
        fontSize: 13,
        marginTop: 4
    },

    introCard: {
        flexDirection: "row",
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.lg,
        padding: SPACING.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: SPACING.xl
    },

    introIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: COLORS.secondary,
        justifyContent: "center",
        alignItems: "center",
        marginRight: SPACING.md
    },

    introIconText: {
        color: COLORS.background,
        fontSize: 24,
        fontWeight: "800"
    },

    introContent: {
        flex: 1
    },

    introTitle: {
        color: COLORS.white,
        fontSize: 17,
        fontWeight: "700",
        marginBottom: 5
    },

    introText: {
        color: COLORS.textSecondary,
        fontSize: 13,
        lineHeight: 20
    },

    sectionTitle: {
        color: COLORS.white,
        fontSize: 17,
        fontWeight: "700",
        marginBottom: SPACING.sm
    },

    input: {
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: RADIUS.md,
        color: COLORS.white,
        paddingHorizontal: SPACING.md,
        paddingVertical: 15,
        fontSize: 14,
        marginBottom: SPACING.md
    },

    // ------------------------------
    // QR SCANNER BUTTON
    // ------------------------------

    scanButton: {
        minHeight: 52,
        borderRadius: RADIUS.md,
        backgroundColor:
            "rgba(255, 215, 0, 0.06)",
        borderWidth: 1,
        borderColor: COLORS.secondary,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: SPACING.lg,
        marginBottom: SPACING.md
    },

    scanButtonIcon: {
        fontSize: 19,
        marginRight: 8
    },

    scanButtonText: {
        color: COLORS.secondary,
        fontSize: 15,
        fontWeight: "800"
    },

    // ------------------------------
    // QR SCANNER
    // ------------------------------

    scannerContainer: {
        width: "100%",
        height: 420,
        marginBottom: SPACING.md,
        borderRadius: RADIUS.lg,
        overflow: "hidden",
        backgroundColor: "#000000",
        position: "relative"
    },

    camera: {
        flex: 1
    },

    scannerOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: "center",
        justifyContent: "center"
    },

    scanFrame: {
        width: 230,
        height: 230,
        borderWidth: 3,
        borderColor: COLORS.secondary,
        borderRadius: RADIUS.md,
        backgroundColor: "transparent"
    },

    scannerText: {
        color: COLORS.white,
        fontSize: 13,
        lineHeight: 19,
        textAlign: "center",
        marginTop: SPACING.md,
        paddingHorizontal: 30,
        fontWeight: "600"
    },

    closeScannerButton: {
        position: "absolute",
        bottom: 16,
        alignSelf: "center",
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: RADIUS.md,
        backgroundColor:
            "rgba(4, 16, 41, 0.9)",
        borderWidth: 1,
        borderColor: COLORS.border
    },

    closeScannerText: {
        color: COLORS.white,
        fontSize: 13,
        fontWeight: "700"
    },

    // ------------------------------
    // VERIFY BUTTON
    // ------------------------------

    verifyButton: {
        minHeight: 52,
        borderRadius: RADIUS.md,
        backgroundColor: COLORS.secondary,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: SPACING.lg,
        marginBottom: SPACING.lg
    },

    verifyButtonDisabled: {
        opacity: 0.7
    },

    verifyIcon: {
        fontSize: 18,
        marginRight: 8
    },

    verifyButtonText: {
        color: COLORS.background,
        fontSize: 15,
        fontWeight: "800"
    },

    // ------------------------------
    // ERROR
    // ------------------------------

    errorCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#3A1720",
        borderWidth: 1,
        borderColor: COLORS.danger,
        borderRadius: RADIUS.md,
        padding: SPACING.md,
        marginBottom: SPACING.lg
    },

    errorIcon: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: COLORS.danger,
        color: COLORS.white,
        textAlign: "center",
        lineHeight: 28,
        fontWeight: "800",
        marginRight: SPACING.sm
    },

    errorText: {
        flex: 1,
        color: COLORS.white,
        fontSize: 13
    },

    // ------------------------------
    // RESULT
    // ------------------------------

    resultContainer: {
        marginTop: SPACING.sm
    },

    statusCard: {
        borderRadius: RADIUS.lg,
        padding: SPACING.xl,
        alignItems: "center",
        marginBottom: SPACING.xl,
        borderWidth: 1
    },

    statusVerified: {
        backgroundColor: "#0D2F24",
        borderColor: COLORS.success
    },

    statusInvalid: {
        backgroundColor: "#351820",
        borderColor: COLORS.danger
    },

    statusIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: SPACING.md
    },

    statusIconVerified: {
        backgroundColor: COLORS.success
    },

    statusIconInvalid: {
        backgroundColor: COLORS.danger
    },

    statusIconText: {
        color: COLORS.white,
        fontSize: 34,
        fontWeight: "800"
    },

    statusTitle: {
        color: COLORS.white,
        fontSize: 20,
        fontWeight: "800",
        textAlign: "center",
        marginBottom: 8
    },

    statusDescription: {
        color: COLORS.textSecondary,
        fontSize: 13,
        lineHeight: 20,
        textAlign: "center"
    },

    card: {
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
        paddingHorizontal: SPACING.md,
        marginBottom: SPACING.xl
    },

    infoRow: {
        paddingVertical: SPACING.md
    },

    infoRowBorder: {
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border
    },

    infoLabel: {
        color: COLORS.textSecondary,
        fontSize: 12,
        marginBottom: 5
    },

    infoValue: {
        color: COLORS.white,
        fontSize: 13,
        fontWeight: "600"
    },

    highlightValue: {
        color: COLORS.secondary,
        fontSize: 18,
        fontWeight: "800"
    },

    checkRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border
    },

    checkLabel: {
        color: COLORS.textSecondary,
        fontSize: 13
    },

    checkValue: {
        fontSize: 13,
        fontWeight: "700"
    },

    checkSuccess: {
        color: COLORS.success
    },

    checkFailed: {
        color: COLORS.danger
    },

    blockchainCard: {
        backgroundColor: "#071B38",
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
        paddingHorizontal: SPACING.md,
        marginBottom: SPACING.xl
    },

    blockchainTitle: {
        color: COLORS.secondary,
        fontSize: 16,
        fontWeight: "800",
        paddingTop: SPACING.md,
        paddingBottom: SPACING.sm
    }
});