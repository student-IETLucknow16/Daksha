
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View
} from "react-native";
import { useRouter } from "expo-router";

import { getAdminCertifications } from "../../services/adminService";
import { COLORS, SPACING, RADIUS } from "../../constants/theme";

export default function AdminCertificationsScreen() {
    const router = useRouter();

    const [certifications, setCertifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    const loadCertifications = async () => {
        try {
            setError("");

            const data = await getAdminCertifications();

            console.log("ADMIN CERTIFICATIONS:", data);

            const list =
                data?.certifications ||
                data?.certificates ||
                data?.data ||
                [];

            setCertifications(
                Array.isArray(list) ? list : []
            );
        } catch (err) {
            console.error(
                "ADMIN CERTIFICATIONS ERROR:",
                err
            );

            setError(
                err?.response?.data?.message ||
                "Unable to load certification data."
            );
        }
    };

    useEffect(() => {
        loadCertifications().finally(() => {
            setLoading(false);
        });
    }, []);

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);

        try {
            await loadCertifications();
        } finally {
            setRefreshing(false);
        }
    }, []);

    const getWorkerName = (item) => {
        if (typeof item.worker === "string") {
            return item.worker;
        }

        return (
            item.worker?.name ||
            item.worker?.fullName ||
            item.user?.name ||
            "Unknown Worker"
        );
    };

    const getWorkerEmail = (item) => {
        return (
            item.worker?.email ||
            item.user?.email ||
            ""
        );
    };

    const getModuleName = (item) => {
        return (
            item.moduleId ||
            item.module?.moduleId ||
            item.module?.title ||
            "Unknown Module"
        );
    };

    const getFinalScore = (item) => {
        const score =
            item.finalScore ??
            item.score;

        if (
            score === undefined ||
            score === null
        ) {
            return "—";
        }

        return `${score}%`;
    };

    const getCertificationStatus = (item) => {
        if (item.verificationStatus) {
            return item.verificationStatus;
        }

        if (item.passed === true) {
            return "verified";
        }

        if (item.passed === false) {
            return "failed";
        }

        return "pending";
    };

    const isVerified = (item) => {
        return (
            getCertificationStatus(item) ===
            "verified"
        );
    };

    const isFailed = (item) => {
        const status = getCertificationStatus(item);

        return (
            status === "failed" ||
            status === "not_issued"
        );
    };

    const getStatusLabel = (item) => {
        const status = getCertificationStatus(item);

        if (status === "verified") {
            return "VERIFIED";
        }

        if (status === "pending") {
            return "PENDING";
        }

        if (status === "failed") {
            return "FAILED";
        }

        if (status === "not_issued") {
            return "NOT ISSUED";
        }

        return String(status).toUpperCase();
    };

    const formatDate = (value) => {
        if (!value) {
            return "—";
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return "—";
        }

        return date.toLocaleDateString();
    };

    const verifiedCount = certifications.filter(
        (item) => isVerified(item)
    ).length;

    const failedCount = certifications.filter(
        (item) => isFailed(item)
    ).length;

    const pendingCount = certifications.filter(
        (item) => {
            const status =
                getCertificationStatus(item);

            return (
                status === "pending" ||
                status === "not_issued"
            );
        }
    ).length;

    const renderCertification = ({ item }) => {
        const status =
            getCertificationStatus(item);

        const workerName =
            getWorkerName(item);

        const workerEmail =
            getWorkerEmail(item);

        const moduleName =
            getModuleName(item);

        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <View style={styles.workerSection}>
                        <Text style={styles.workerName}>
                            {workerName}
                        </Text>

                        {workerEmail ? (
                            <Text
                                style={styles.workerEmail}
                            >
                                {workerEmail}
                            </Text>
                        ) : null}
                    </View>

                    <View
                        style={[
                            styles.statusBadge,
                            status === "verified"
                                ? styles.verifiedBadge
                                : status === "failed" ||
                                  status === "not_issued"
                                ? styles.failedBadge
                                : styles.pendingBadge
                        ]}
                    >
                        <Text
                            style={[
                                styles.statusText,
                                status === "verified"
                                    ? styles.verifiedText
                                    : status === "failed" ||
                                      status === "not_issued"
                                    ? styles.failedText
                                    : styles.pendingText
                            ]}
                        >
                            {getStatusLabel(item)}
                        </Text>
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.infoGrid}>
                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>
                            Module
                        </Text>

                        <Text style={styles.infoValue}>
                            {moduleName}
                        </Text>
                    </View>

                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>
                            Final Score
                        </Text>

                        <Text style={styles.scoreValue}>
                            {getFinalScore(item)}
                        </Text>
                    </View>

                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>
                            Certificate ID
                        </Text>

                        <Text
                            style={styles.idValue}
                            numberOfLines={1}
                        >
                            {item.certificateId || "—"}
                        </Text>
                    </View>

                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>
                            Issued
                        </Text>

                        <Text style={styles.infoValue}>
                            {formatDate(
                                item.issuedAt ||
                                item.createdAt
                            )}
                        </Text>
                    </View>
                </View>

                <View style={styles.blockchainBox}>
                    <View style={styles.blockchainHeader}>
                        <Text style={styles.blockchainTitle}>
                            Blockchain
                        </Text>

                        <Text
                            style={[
                                styles.blockchainStatus,
                                isVerified(item)
                                    ? styles.verifiedText
                                    : styles.pendingText
                            ]}
                        >
                            {isVerified(item)
                                ? "✓ VERIFIED"
                                : "NOT VERIFIED"}
                        </Text>
                    </View>

                    <Text
                        style={styles.transactionText}
                        numberOfLines={1}
                    >
                        TX:{" "}
                        {item.blockchainTransactionId ||
                            "Not available"}
                    </Text>

                    <Text style={styles.networkText}>
                        Network:{" "}
                        {item.blockchainNetwork ||
                            "Local Hardhat"}
                    </Text>
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator
                        size="large"
                        color={COLORS.secondary}
                    />

                    <Text style={styles.loadingText}>
                        Loading certifications...
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <View style={styles.backButtonContainer}>
                            <Text
                                style={styles.backButton}
                                onPress={() =>
                                    router.replace(
                                        "/admin/dashboard"
                                    )
                                }
                            >
                                ‹
                            </Text>
                        </View>

                        <View
                            style={
                                styles.headerTextContainer
                            }
                        >
                            <Text style={styles.title}>
                                Certifications
                            </Text>

                            <Text style={styles.subtitle}>
                                Monitor worker certificates
                            </Text>
                        </View>
                    </View>

                    <View style={styles.headerIcon}>
                        <Text
                            style={styles.headerIconText}
                        >
                            ✓
                        </Text>
                    </View>
                </View>

                {/* Error */}
                {error ? (
                    <View style={styles.errorBox}>
                        <Text
                            style={styles.errorTitle}
                        >
                            Unable to load certifications
                        </Text>

                        <Text style={styles.errorText}>
                            {error}
                        </Text>
                    </View>
                ) : null}

                {/* Statistics */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={
                        false
                    }
                    contentContainerStyle={
                        styles.statsRow
                    }
                >
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>
                            {certifications.length}
                        </Text>

                        <Text style={styles.statLabel}>
                            Total
                        </Text>
                    </View>

                    <View style={styles.statCard}>
                        <Text
                            style={[
                                styles.statValue,
                                styles.successValue
                            ]}
                        >
                            {verifiedCount}
                        </Text>

                        <Text style={styles.statLabel}>
                            Verified
                        </Text>
                    </View>

                    <View style={styles.statCard}>
                        <Text
                            style={[
                                styles.statValue,
                                styles.dangerValue
                            ]}
                        >
                            {failedCount}
                        </Text>

                        <Text style={styles.statLabel}>
                            Failed
                        </Text>
                    </View>

                    <View style={styles.statCard}>
                        <Text
                            style={[
                                styles.statValue,
                                styles.warningValue
                            ]}
                        >
                            {pendingCount}
                        </Text>

                        <Text style={styles.statLabel}>
                            Pending
                        </Text>
                    </View>
                </ScrollView>

                {/* Section */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>
                        Issued Certificates
                    </Text>

                    <Text style={styles.sectionCount}>
                        {certifications.length}
                    </Text>
                </View>

                {/* List */}
                <FlatList
                    data={certifications}
                    keyExtractor={(item, index) =>
                        String(
                            item?._id ||
                            item?.id ||
                            item?.certificateId ||
                            index
                        )
                    }
                    renderItem={
                        renderCertification
                    }
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={[
                        styles.listContent,
                        certifications.length === 0 &&
                            styles.emptyListContent
                    ]}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={
                                handleRefresh
                            }
                            tintColor={
                                COLORS.secondary
                            }
                        />
                    }
                    ListEmptyComponent={
                        <View
                            style={
                                styles.emptyContainer
                            }
                        >
                            <View
                                style={
                                    styles.emptyIcon
                                }
                            >
                                <Text
                                    style={
                                        styles.emptyIconText
                                    }
                                >
                                    ✓
                                </Text>
                            </View>

                            <Text
                                style={
                                    styles.emptyTitle
                                }
                            >
                                No certifications found
                            </Text>

                            <Text
                                style={
                                    styles.emptyText
                                }
                            >
                                Certificates will appear
                                here after workers
                                complete training and
                                assessment.
                            </Text>
                        </View>
                    }
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.background
    },

    container: {
        flex: 1,
        paddingHorizontal: SPACING.md
    },

    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: COLORS.background
    },

    loadingText: {
        marginTop: SPACING.md,
        color: COLORS.textSecondary,
        fontSize: 14
    },

    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingTop: SPACING.md,
        paddingBottom: SPACING.md
    },

    headerLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1
    },

    backButtonContainer: {
        width: 42,
        height: 42,
        borderRadius: RADIUS.md,
        backgroundColor:
            "rgba(255, 255, 255, 0.06)",
        borderWidth: 1,
        borderColor: COLORS.border,
        justifyContent: "center",
        alignItems: "center",
        marginRight: SPACING.sm
    },

    backButton: {
        color: COLORS.white,
        fontSize: 32,
        lineHeight: 34,
        fontWeight: "300",
        marginTop: -3
    },

    headerTextContainer: {
        flex: 1
    },

    title: {
        color: COLORS.white,
        fontSize: 26,
        fontWeight: "800"
    },

    subtitle: {
        color: COLORS.textSecondary,
        fontSize: 13,
        marginTop: 4
    },

    headerIcon: {
        width: 46,
        height: 46,
        borderRadius: RADIUS.md,
        backgroundColor:
            "rgba(255, 215, 0, 0.12)",
        borderWidth: 1,
        borderColor: COLORS.secondary,
        justifyContent: "center",
        alignItems: "center"
    },

    headerIconText: {
        color: COLORS.secondary,
        fontSize: 22,
        fontWeight: "800"
    },

    errorBox: {
        backgroundColor:
            "rgba(239, 68, 68, 0.12)",
        borderWidth: 1,
        borderColor: COLORS.danger,
        borderRadius: RADIUS.md,
        padding: SPACING.md,
        marginBottom: SPACING.md
    },

    errorTitle: {
        color: COLORS.danger,
        fontSize: 15,
        fontWeight: "700",
        marginBottom: 4
    },

    errorText: {
        color: COLORS.textSecondary,
        fontSize: 13
    },

    statsRow: {
        gap: SPACING.sm,
        paddingBottom: SPACING.md
    },

    statCard: {
        width: 115,
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: RADIUS.md,
        padding: SPACING.md
    },

    statValue: {
        color: COLORS.secondary,
        fontSize: 24,
        fontWeight: "800"
    },

    statLabel: {
        color: COLORS.textSecondary,
        fontSize: 12,
        marginTop: 3
    },

    successValue: {
        color: COLORS.success
    },

    dangerValue: {
        color: COLORS.danger
    },

    warningValue: {
        color: COLORS.warning
    },

    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: SPACING.sm
    },

    sectionTitle: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: "700"
    },

    sectionCount: {
        color: COLORS.secondary,
        fontSize: 13,
        fontWeight: "700"
    },

    listContent: {
        paddingBottom: SPACING.xl
    },

    emptyListContent: {
        flexGrow: 1
    },

    card: {
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: RADIUS.lg,
        padding: SPACING.md,
        marginBottom: SPACING.sm
    },

    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start"
    },

    workerSection: {
        flex: 1,
        paddingRight: SPACING.sm
    },

    workerName: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: "700"
    },

    workerEmail: {
        color: COLORS.textSecondary,
        fontSize: 12,
        marginTop: 3
    },

    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
        borderWidth: 1
    },

    verifiedBadge: {
        backgroundColor:
            "rgba(34, 197, 94, 0.12)",
        borderColor: COLORS.success
    },

    failedBadge: {
        backgroundColor:
            "rgba(239, 68, 68, 0.12)",
        borderColor: COLORS.danger
    },

    pendingBadge: {
        backgroundColor:
            "rgba(245, 158, 11, 0.12)",
        borderColor: COLORS.warning
    },

    statusText: {
        fontSize: 10,
        fontWeight: "800"
    },

    verifiedText: {
        color: COLORS.success
    },

    failedText: {
        color: COLORS.danger
    },

    pendingText: {
        color: COLORS.warning
    },

    divider: {
        height: 1,
        backgroundColor: COLORS.border,
        marginVertical: SPACING.md
    },

    infoGrid: {
        flexDirection: "row",
        flexWrap: "wrap"
    },

    infoItem: {
        width: "50%",
        marginBottom: SPACING.sm
    },

    infoLabel: {
        color: COLORS.textSecondary,
        fontSize: 11,
        marginBottom: 3
    },

    infoValue: {
        color: COLORS.white,
        fontSize: 13,
        fontWeight: "600"
    },

    scoreValue: {
        color: COLORS.secondary,
        fontSize: 15,
        fontWeight: "800"
    },

    idValue: {
        color: COLORS.textSecondary,
        fontSize: 11
    },

    blockchainBox: {
        marginTop: SPACING.sm,
        padding: SPACING.sm,
        backgroundColor:
            "rgba(4, 16, 41, 0.55)",
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: RADIUS.md
    },

    blockchainHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 6
    },

    blockchainTitle: {
        color: COLORS.white,
        fontSize: 13,
        fontWeight: "700"
    },

    blockchainStatus: {
        fontSize: 10,
        fontWeight: "800"
    },

    transactionText: {
        color: COLORS.textSecondary,
        fontSize: 10
    },

    networkText: {
        color: COLORS.textSecondary,
        fontSize: 10,
        marginTop: 3
    },

    emptyContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: SPACING.xl,
        paddingVertical: 60
    },

    emptyIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor:
            "rgba(255, 215, 0, 0.12)",
        borderWidth: 1,
        borderColor: COLORS.secondary,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: SPACING.md
    },

    emptyIconText: {
        color: COLORS.secondary,
        fontSize: 28,
        fontWeight: "800"
    },

    emptyTitle: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: "700",
        textAlign: "center"
    },

    emptyText: {
        color: COLORS.textSecondary,
        fontSize: 13,
        textAlign: "center",
        marginTop: SPACING.sm,
        lineHeight: 20
    }
});





