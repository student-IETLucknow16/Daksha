
import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";

import { getSiteOfficerCertifications } from "../../services/siteOfficerService";
import { COLORS, SPACING, RADIUS } from "../../constants/theme";

export default function SiteOfficerCertificationsScreen() {
    const router = useRouter();

    const [certifications, setCertifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadCertifications();
    }, []);

    const loadCertifications = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getSiteOfficerCertifications();

            console.log("SITE OFFICER CERTIFICATIONS:", data);

            const certificationData =
                data?.certifications ||
                data?.certificates ||
                data?.data ||
                [];

            setCertifications(
                Array.isArray(certificationData)
                    ? certificationData
                    : []
            );
        } catch (err) {
            console.error(
                "Failed to load site officer certifications:",
                err
            );

            setError(
                err?.response?.data?.message ||
                    "Unable to load certification data."
            );
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date) => {
        if (!date) return "—";

        try {
            return new Date(date).toLocaleDateString();
        } catch {
            return "—";
        }
    };

    const getWorkerName = (item) => {
        if (item?.worker?.name) return item.worker.name;
        if (item?.workerName) return item.workerName;

        return "Unknown Worker";
    };

    const getWorkerEmail = (item) => {
        if (item?.worker?.email) return item.worker.email;
        if (item?.workerEmail) return item.workerEmail;

        return "—";
    };

    const getCertificationStatus = (item) => {
        if (item?.verificationStatus) {
            return String(item.verificationStatus)
                .replaceAll("_", " ")
                .toUpperCase();
        }

        if (item?.passed === true) {
            return "VERIFIED";
        }

        if (item?.passed === false) {
            return "FAILED";
        }

        return "PENDING";
    };

    const getStatusColor = (item) => {
        const status = item?.verificationStatus;

        if (
            status === "verified" ||
            item?.passed === true
        ) {
            return COLORS.success;
        }

        if (
            status === "failed" ||
            item?.passed === false
        ) {
            return COLORS.danger;
        }

        return COLORS.warning;
    };

    return (
        <View style={styles.container}>
            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator
                        size="large"
                        color={COLORS.secondary}
                    />

                    <Text style={styles.loadingText}>
                        Loading certification records...
                    </Text>
                </View>
            ) : (
                <ScrollView
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={false}
                >
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() =>
                            router.replace(
                                "/site-officer/dashboard"
                            )
                        }
                    >
                        <Text style={styles.backText}>
                            ← Dashboard
                        </Text>
                    </TouchableOpacity>

                    <Text style={styles.title}>
                        Certifications
                    </Text>

                    <Text style={styles.subtitle}>
                        Monitor worker certificates and
                        blockchain verification status.
                    </Text>

                    {error ? (
                        <View style={styles.errorCard}>
                            <Text style={styles.errorText}>
                                {error}
                            </Text>

                            <TouchableOpacity
                                style={styles.retryButton}
                                onPress={loadCertifications}
                            >
                                <Text
                                    style={styles.retryText}
                                >
                                    Retry
                                </Text>
                            </TouchableOpacity>
                        </View>
                    ) : null}

                    {!error &&
                    certifications.length === 0 ? (
                        <View style={styles.emptyCard}>
                            <Text style={styles.emptyTitle}>
                                No Certifications
                            </Text>

                            <Text style={styles.emptyText}>
                                No certification records are
                                available for your site yet.
                            </Text>
                        </View>
                    ) : null}

                    {certifications.map((item, index) => {
                        const statusColor =
                            getStatusColor(item);

                        return (
                            <View
                                key={
                                    item?._id ||
                                    item?.id ||
                                    index
                                }
                                style={styles.certificationCard}
                            >
                                <View
                                    style={
                                        styles.cardHeader
                                    }
                                >
                                    <View
                                        style={
                                            styles.workerSection
                                        }
                                    >
                                        <Text
                                            style={
                                                styles.workerName
                                            }
                                        >
                                            {getWorkerName(
                                                item
                                            )}
                                        </Text>

                                        <Text
                                            style={
                                                styles.workerEmail
                                            }
                                        >
                                            {getWorkerEmail(
                                                item
                                            )}
                                        </Text>
                                    </View>

                                    <View
                                        style={[
                                            styles.statusBadge,
                                            {
                                                borderColor:
                                                    statusColor,
                                            },
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.statusText,
                                                {
                                                    color:
                                                        statusColor,
                                                },
                                            ]}
                                        >
                                            {getCertificationStatus(
                                                item
                                            )}
                                        </Text>
                                    </View>
                                </View>

                                <View
                                    style={styles.divider}
                                />

                                <View
                                    style={styles.infoGrid}
                                >
                                    <View
                                        style={
                                            styles.infoItem
                                        }
                                    >
                                        <Text
                                            style={
                                                styles.infoLabel
                                            }
                                        >
                                            Module
                                        </Text>

                                        <Text
                                            style={
                                                styles.infoValue
                                            }
                                        >
                                            {item?.moduleId ||
                                                item?.module
                                                    ?.moduleId ||
                                                "—"}
                                        </Text>
                                    </View>

                                    <View
                                        style={
                                            styles.infoItem
                                        }
                                    >
                                        <Text
                                            style={
                                                styles.infoLabel
                                            }
                                        >
                                            Final Score
                                        </Text>

                                        <Text
                                            style={
                                                styles.scoreValue
                                            }
                                        >
                                            {item?.finalScore ??
                                                "—"}
                                            {item?.finalScore !==
                                            undefined
                                                ? "%"
                                                : ""}
                                        </Text>
                                    </View>

                                    <View
                                        style={
                                            styles.infoItem
                                        }
                                    >
                                        <Text
                                            style={
                                                styles.infoLabel
                                            }
                                        >
                                            Scenario
                                        </Text>

                                        <Text
                                            style={
                                                styles.infoValue
                                            }
                                        >
                                            {item?.scenarioScore ??
                                                "—"}
                                            {item?.scenarioScore !==
                                            undefined
                                                ? "%"
                                                : ""}
                                        </Text>
                                    </View>

                                    <View
                                        style={
                                            styles.infoItem
                                        }
                                    >
                                        <Text
                                            style={
                                                styles.infoLabel
                                            }
                                        >
                                            Quiz
                                        </Text>

                                        <Text
                                            style={
                                                styles.infoValue
                                            }
                                        >
                                            {item?.quizScore ??
                                                "—"}
                                            {item?.quizScore !==
                                            undefined
                                                ? "%"
                                                : ""}
                                        </Text>
                                    </View>
                                </View>

                                <View
                                    style={styles.blockchainBox}
                                >
                                    <Text
                                        style={
                                            styles.blockchainTitle
                                        }
                                    >
                                        Blockchain Verification
                                    </Text>

                                    <Text
                                        style={
                                            styles.blockchainText
                                        }
                                    >
                                        Certificate ID:{" "}
                                        {item?.certificateId ||
                                            "Not issued"}
                                    </Text>

                                    <Text
                                        style={
                                            styles.blockchainText
                                        }
                                    >
                                        Transaction:{" "}
                                        {item?.blockchainTransactionId ||
                                            "Not available"}
                                    </Text>

                                    <Text
                                        style={
                                            styles.blockchainText
                                        }
                                    >
                                        Network:{" "}
                                        {item?.blockchainNetwork ||
                                            "—"}
                                    </Text>

                                    <Text
                                        style={
                                            styles.blockchainText
                                        }
                                    >
                                        Issued:{" "}
                                        {formatDate(
                                            item?.issuedAt
                                        )}
                                    </Text>
                                </View>
                            </View>
                        );
                    })}
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },

    content: {
        padding: SPACING.lg,
        paddingBottom: SPACING.xl * 2,
    },

    center: {
        flex: 1,
        backgroundColor: COLORS.background,
        justifyContent: "center",
        alignItems: "center",
        padding: SPACING.lg,
    },

    loadingText: {
        color: COLORS.textSecondary,
        marginTop: SPACING.md,
        fontSize: 15,
    },

    backButton: {
        alignSelf: "flex-start",
        marginBottom: SPACING.lg,
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.md,
        borderRadius: RADIUS.md,
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
    },

    backText: {
        color: COLORS.secondary,
        fontSize: 14,
        fontWeight: "600",
    },

    title: {
        color: COLORS.text,
        fontSize: 28,
        fontWeight: "800",
        marginBottom: SPACING.xs,
    },

    subtitle: {
        color: COLORS.textSecondary,
        fontSize: 14,
        lineHeight: 21,
        marginBottom: SPACING.lg,
    },

    errorCard: {
        backgroundColor: "#3A1720",
        borderWidth: 1,
        borderColor: COLORS.danger,
        borderRadius: RADIUS.lg,
        padding: SPACING.md,
        marginBottom: SPACING.lg,
    },

    errorText: {
        color: COLORS.text,
        fontSize: 14,
        marginBottom: SPACING.md,
    },

    retryButton: {
        alignSelf: "flex-start",
        backgroundColor: COLORS.danger,
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.lg,
        borderRadius: RADIUS.md,
    },

    retryText: {
        color: COLORS.white,
        fontWeight: "700",
    },

    emptyCard: {
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: RADIUS.lg,
        padding: SPACING.xl,
        alignItems: "center",
    },

    emptyTitle: {
        color: COLORS.text,
        fontSize: 18,
        fontWeight: "700",
        marginBottom: SPACING.sm,
    },

    emptyText: {
        color: COLORS.textSecondary,
        textAlign: "center",
        lineHeight: 21,
    },

    certificationCard: {
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: RADIUS.lg,
        padding: SPACING.md,
        marginBottom: SPACING.md,
    },

    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
    },

    workerSection: {
        flex: 1,
        marginRight: SPACING.sm,
    },

    workerName: {
        color: COLORS.text,
        fontSize: 17,
        fontWeight: "700",
        marginBottom: 4,
    },

    workerEmail: {
        color: COLORS.textSecondary,
        fontSize: 12,
    },

    statusBadge: {
        borderWidth: 1,
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 5,
    },

    statusText: {
        fontSize: 10,
        fontWeight: "800",
    },

    divider: {
        height: 1,
        backgroundColor: COLORS.border,
        marginVertical: SPACING.md,
    },

    infoGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
    },

    infoItem: {
        width: "48%",
        marginBottom: SPACING.md,
    },

    infoLabel: {
        color: COLORS.textSecondary,
        fontSize: 11,
        marginBottom: 4,
    },

    infoValue: {
        color: COLORS.text,
        fontSize: 14,
        fontWeight: "600",
    },

    scoreValue: {
        color: COLORS.secondary,
        fontSize: 15,
        fontWeight: "800",
    },

    blockchainBox: {
        marginTop: SPACING.sm,
        padding: SPACING.md,
        backgroundColor: "#071B3D",
        borderRadius: RADIUS.md,
        borderWidth: 1,
        borderColor: COLORS.border,
    },

    blockchainTitle: {
        color: COLORS.secondary,
        fontSize: 13,
        fontWeight: "800",
        marginBottom: SPACING.sm,
    },

    blockchainText: {
        color: COLORS.textSecondary,
        fontSize: 12,
        lineHeight: 19,
        marginBottom: 3,
    },
});


