
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

import { getAdminAssessments } from "../../services/adminService";
import { COLORS, SPACING, RADIUS } from "../../constants/theme";

export default function AdminAssessmentsScreen() {
    const router = useRouter();

    const [assessments, setAssessments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    const loadAssessments = async () => {
        try {
            setError("");

            const data = await getAdminAssessments();

            console.log("ADMIN ASSESSMENTS:", data);

            const list =
                data?.assessments ||
                data?.assessmentAttempts ||
                data?.attempts ||
                data?.data ||
                [];

            setAssessments(Array.isArray(list) ? list : []);
        } catch (err) {
            console.error("ADMIN ASSESSMENTS ERROR:", err);

            setError(
                err?.response?.data?.message ||
                "Unable to load assessment data."
            );
        }
    };

    useEffect(() => {
        loadAssessments().finally(() => {
            setLoading(false);
        });
    }, []);

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);

        try {
            await loadAssessments();
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
        if (item.worker?.email) {
            return item.worker.email;
        }

        if (item.user?.email) {
            return item.user.email;
        }

        return "";
    };

    const getModuleName = (item) => {
        return (
            item.moduleId ||
            item.module?.moduleId ||
            item.module?.title ||
            "Unknown Module"
        );
    };

    const getScore = (item) => {
        const score =
            item.quizScore ??
            item.score ??
            item.assessmentScore;

        return score !== undefined && score !== null
            ? `${score}%`
            : "—";
    };

    const isPassed = (item) => {
        if (typeof item.passed === "boolean") {
            return item.passed;
        }

        if (item.result) {
            return item.result === "passed";
        }

        return false;
    };

    const getStatus = (item) => {
        if (isPassed(item)) {
            return "PASSED";
        }

        if (
            item.completedAt ||
            item.result === "failed" ||
            item.passed === false
        ) {
            return "FAILED";
        }

        return "IN PROGRESS";
    };

    const formatDate = (dateValue) => {
        if (!dateValue) {
            return "—";
        }

        const date = new Date(dateValue);

        if (Number.isNaN(date.getTime())) {
            return "—";
        }

        return date.toLocaleDateString();
    };

    const passedCount = assessments.filter(
        (item) => isPassed(item)
    ).length;

    const failedCount = assessments.filter(
        (item) =>
            !isPassed(item) &&
            (
                item.completedAt ||
                item.result === "failed" ||
                item.passed === false
            )
    ).length;

    const pendingCount = Math.max(
        assessments.length - passedCount - failedCount,
        0
    );

    const renderAssessment = ({ item }) => {
        const status = getStatus(item);
        const workerName = getWorkerName(item);
        const workerEmail = getWorkerEmail(item);
        const moduleName = getModuleName(item);

        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <View style={styles.workerSection}>
                        <Text style={styles.workerName}>
                            {workerName}
                        </Text>

                        {workerEmail ? (
                            <Text style={styles.workerEmail}>
                                {workerEmail}
                            </Text>
                        ) : null}
                    </View>

                    <View
                        style={[
                            styles.statusBadge,
                            status === "PASSED"
                                ? styles.passedBadge
                                : status === "FAILED"
                                ? styles.failedBadge
                                : styles.pendingBadge
                        ]}
                    >
                        <Text
                            style={[
                                styles.statusText,
                                status === "PASSED"
                                    ? styles.passedText
                                    : status === "FAILED"
                                    ? styles.failedText
                                    : styles.pendingText
                            ]}
                        >
                            {status}
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
                            Score
                        </Text>

                        <Text style={styles.scoreValue}>
                            {getScore(item)}
                        </Text>
                    </View>

                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>
                            Completed
                        </Text>

                        <Text style={styles.infoValue}>
                            {formatDate(item.completedAt)}
                        </Text>
                    </View>

                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>
                            Attempt ID
                        </Text>

                        <Text
                            style={styles.idValue}
                            numberOfLines={1}
                        >
                            {item._id || item.id || "—"}
                        </Text>
                    </View>
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
                        Loading assessments...
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
                                onPress={() => router.replace("/admin/dashboard")}
                            >
                                ‹
                            </Text>
                        </View>

                        <View style={styles.headerTextContainer}>
                            <Text style={styles.title}>
                                Assessments
                            </Text>

                            <Text style={styles.subtitle}>
                                Monitor worker assessment performance
                            </Text>
                        </View>
                    </View>

                    <View style={styles.headerIcon}>
                        <Text style={styles.headerIconText}>
                            ✓
                        </Text>
                    </View>
                </View>

                {/* Error */}
                {error ? (
                    <View style={styles.errorBox}>
                        <Text style={styles.errorTitle}>
                            Unable to load assessments
                        </Text>

                        <Text style={styles.errorText}>
                            {error}
                        </Text>
                    </View>
                ) : null}

                {/* Statistics */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.statsRow}
                >
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>
                            {assessments.length}
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
                            {passedCount}
                        </Text>

                        <Text style={styles.statLabel}>
                            Passed
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

                {/* Section Header */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>
                        Assessment Attempts
                    </Text>

                    <Text style={styles.sectionCount}>
                        {assessments.length}
                    </Text>
                </View>

                {/* Assessment List */}
                <FlatList
                    data={assessments}
                    keyExtractor={(item, index) =>
                        String(
                            item?._id ||
                            item?.id ||
                            index
                        )
                    }
                    renderItem={renderAssessment}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={[
                        styles.listContent,
                        assessments.length === 0 &&
                            styles.emptyListContent
                    ]}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            tintColor={COLORS.secondary}
                        />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <View style={styles.emptyIcon}>
                                <Text style={styles.emptyIconText}>
                                    ✓
                                </Text>
                            </View>

                            <Text style={styles.emptyTitle}>
                                No assessments found
                            </Text>

                            <Text style={styles.emptyText}>
                                Worker assessment attempts will
                                appear here after submission.
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
        backgroundColor: "rgba(255, 255, 255, 0.06)",
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
        backgroundColor: "rgba(255, 215, 0, 0.12)",
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
        backgroundColor: "rgba(239, 68, 68, 0.12)",
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

    passedBadge: {
        backgroundColor: "rgba(34, 197, 94, 0.12)",
        borderColor: COLORS.success
    },

    failedBadge: {
        backgroundColor: "rgba(239, 68, 68, 0.12)",
        borderColor: COLORS.danger
    },

    pendingBadge: {
        backgroundColor: "rgba(245, 158, 11, 0.12)",
        borderColor: COLORS.warning
    },

    statusText: {
        fontSize: 10,
        fontWeight: "800"
    },

    passedText: {
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
        backgroundColor: "rgba(255, 215, 0, 0.12)",
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



