
import React, {
    useCallback,
    useEffect,
    useState
} from "react";

import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";

import { useRouter } from "expo-router";

import { getAdminAnalytics } from "../../services/adminService";
import { COLORS, RADIUS, SPACING } from "../../constants/theme";

export default function AdminAnalytics() {
    const router = useRouter();

    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    const loadAnalytics = async () => {
        try {
            setError("");

            const data = await getAdminAnalytics();

            console.log("ADMIN ANALYTICS:", data);

            setAnalytics(data);
        } catch (err) {
            console.error("ADMIN ANALYTICS ERROR:", err);

            setError(
                err?.response?.data?.message ||
                "Unable to load analytics."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadAnalytics();
    }, []);

    const handleRefresh = useCallback(() => {
        setRefreshing(true);
        loadAnalytics();
    }, []);

    /*
     * The backend response structure may contain different
     * field names, so we safely support common structures.
     */
    const statistics =
        analytics?.statistics ||
        analytics?.stats ||
        analytics?.summary ||
        {};

    const totalWorkers =
        statistics.totalWorkers ??
        analytics?.totalWorkers ??
        0;

    const trainingAttempts =
        statistics.trainingAttempts ??
        statistics.totalTrainingAttempts ??
        analytics?.trainingAttempts ??
        analytics?.totalTrainingAttempts ??
        0;

    const completedTraining =
        statistics.completedTraining ??
        statistics.completedTrainingAttempts ??
        analytics?.completedTraining ??
        0;

    const passedTraining =
        statistics.passedTraining ??
        statistics.passedTrainingAttempts ??
        analytics?.passedTraining ??
        0;

    const assessmentAttempts =
        statistics.assessmentAttempts ??
        statistics.totalAssessments ??
        analytics?.assessmentAttempts ??
        analytics?.totalAssessments ??
        0;

    const passedAssessments =
        statistics.passedAssessments ??
        analytics?.passedAssessments ??
        0;

    const certificatesIssued =
        statistics.certificatesIssued ??
        statistics.totalCertificates ??
        analytics?.certificatesIssued ??
        analytics?.totalCertificates ??
        0;

    const verifiedCertificates =
        statistics.verifiedCertificates ??
        analytics?.verifiedCertificates ??
        0;

    const trainingPassRate =
        trainingAttempts > 0
            ? Math.round((passedTraining / trainingAttempts) * 100)
            : 0;

    const trainingCompletionRate =
        trainingAttempts > 0
            ? Math.round((completedTraining / trainingAttempts) * 100)
            : 0;

    const assessmentPassRate =
        assessmentAttempts > 0
            ? Math.round(
                (passedAssessments / assessmentAttempts) * 100
            )
            : 0;

    const certificateVerificationRate =
        certificatesIssued > 0
            ? Math.round(
                (verifiedCertificates / certificatesIssued) * 100
            )
            : 0;

    const modulePerformance =
        analytics?.modulePerformance ||
        analytics?.modules ||
        analytics?.moduleWisePerformance ||
        [];

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator
                    size="large"
                    color={COLORS.secondary}
                />

                <Text style={styles.loadingText}>
                    Loading analytics...
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        tintColor={COLORS.secondary}
                    />
                }
                showsVerticalScrollIndicator={false}
            >
                {/* HEADER */}

                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <TouchableOpacity
                            style={styles.backButtonContainer}
                            onPress={() =>
                                router.replace("/admin/dashboard")
                            }
                        >
                            <Text style={styles.backButton}>
                                ‹
                            </Text>
                        </TouchableOpacity>

                        <View style={styles.headerTextContainer}>
                            <Text style={styles.title}>
                                Analytics
                            </Text>

                            <Text style={styles.subtitle}>
                                Training and certification insights
                            </Text>
                        </View>
                    </View>

                    <View style={styles.headerIcon}>
                        <Text style={styles.headerIconText}>
                            ↗
                        </Text>
                    </View>
                </View>

                {/* ERROR */}

                {error ? (
                    <View style={styles.errorCard}>
                        <Text style={styles.errorTitle}>
                            Unable to load analytics
                        </Text>

                        <Text style={styles.errorText}>
                            {error}
                        </Text>

                        <TouchableOpacity
                            style={styles.retryButton}
                            onPress={loadAnalytics}
                        >
                            <Text style={styles.retryText}>
                                Retry
                            </Text>
                        </TouchableOpacity>
                    </View>
                ) : null}

                {/* OVERVIEW */}

                <Text style={styles.sectionTitle}>
                    System Overview
                </Text>

                <View style={styles.grid}>
                    <StatCard
                        title="Workers"
                        value={totalWorkers}
                        icon="👥"
                    />

                    <StatCard
                        title="Training Attempts"
                        value={trainingAttempts}
                        icon="🎯"
                    />

                    <StatCard
                        title="Assessments"
                        value={assessmentAttempts}
                        icon="📝"
                    />

                    <StatCard
                        title="Certificates"
                        value={certificatesIssued}
                        icon="🏆"
                    />
                </View>

                {/* TRAINING */}

                <Text style={styles.sectionTitle}>
                    Training Performance
                </Text>

                <View style={styles.performanceCard}>
                    <PerformanceRow
                        label="Completion Rate"
                        value={`${trainingCompletionRate}%`}
                        description={`${completedTraining} of ${trainingAttempts} attempts completed`}
                    />

                    <View style={styles.divider} />

                    <PerformanceRow
                        label="Pass Rate"
                        value={`${trainingPassRate}%`}
                        description={`${passedTraining} training attempts passed`}
                    />
                </View>

                {/* ASSESSMENT */}

                <Text style={styles.sectionTitle}>
                    Assessment Performance
                </Text>

                <View style={styles.performanceCard}>
                    <PerformanceRow
                        label="Assessment Pass Rate"
                        value={`${assessmentPassRate}%`}
                        description={`${passedAssessments} of ${assessmentAttempts} assessments passed`}
                    />
                </View>

                {/* CERTIFICATION */}

                <Text style={styles.sectionTitle}>
                    Certification
                </Text>

                <View style={styles.performanceCard}>
                    <PerformanceRow
                        label="Certificates Issued"
                        value={certificatesIssued}
                        description="Total certificates generated"
                    />

                    <View style={styles.divider} />

                    <PerformanceRow
                        label="Blockchain Verified"
                        value={`${certificateVerificationRate}%`}
                        description={`${verifiedCertificates} certificates verified`}
                    />
                </View>

                {/* MODULE PERFORMANCE */}

                <Text style={styles.sectionTitle}>
                    Module Performance
                </Text>

                {modulePerformance.length > 0 ? (
                    modulePerformance.map((module, index) => {
                        const moduleId =
                            module.moduleId ||
                            module.id ||
                            `module-${index}`;

                        const moduleName =
                            module.title ||
                            module.name ||
                            module.moduleId ||
                            "Training Module";

                        const attempts =
                            module.attempts ??
                            module.totalAttempts ??
                            0;

                        const passed =
                            module.passed ??
                            module.passedAttempts ??
                            0;

                        const passRate =
                            module.passRate ??
                            (attempts > 0
                                ? Math.round(
                                    (passed / attempts) * 100
                                )
                                : 0);

                        return (
                            <View
                                key={moduleId}
                                style={styles.moduleCard}
                            >
                                <View style={styles.moduleHeader}>
                                    <View style={styles.moduleInfo}>
                                        <Text
                                            style={styles.moduleName}
                                        >
                                            {moduleName}
                                        </Text>

                                        <Text
                                            style={styles.moduleId}
                                        >
                                            {module.moduleId || ""}
                                        </Text>
                                    </View>

                                    <Text
                                        style={styles.moduleRate}
                                    >
                                        {passRate}%
                                    </Text>
                                </View>

                                <View style={styles.progressBackground}>
                                    <View
                                        style={[
                                            styles.progressFill,
                                            {
                                                width: `${Math.min(
                                                    Math.max(
                                                        passRate,
                                                        0
                                                    ),
                                                    100
                                                )}%`
                                            }
                                        ]}
                                    />
                                </View>

                                <Text style={styles.moduleStats}>
                                    {attempts} attempts • {passed} passed
                                </Text>
                            </View>
                        );
                    })
                ) : (
                    <View style={styles.emptyCard}>
                        <Text style={styles.emptyIcon}>
                            ◌
                        </Text>

                        <Text style={styles.emptyTitle}>
                            No module analytics
                        </Text>

                        <Text style={styles.emptyText}>
                            Module performance data will appear here
                            when training activity is available.
                        </Text>
                    </View>
                )}

                {/* FOOTER */}

                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        SIH26041 • Admin Analytics
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}


/* =========================
   STAT CARD
========================= */

function StatCard({ title, value, icon }) {
    return (
        <View style={styles.statCard}>
            <View style={styles.statIcon}>
                <Text style={styles.statIconText}>
                    {icon}
                </Text>
            </View>

            <Text style={styles.statValue}>
                {value}
            </Text>

            <Text style={styles.statTitle}>
                {title}
            </Text>
        </View>
    );
}


/* =========================
   PERFORMANCE ROW
========================= */

function PerformanceRow({
    label,
    value,
    description
}) {
    return (
        <View style={styles.performanceRow}>
            <View style={styles.performanceInfo}>
                <Text style={styles.performanceLabel}>
                    {label}
                </Text>

                <Text style={styles.performanceDescription}>
                    {description}
                </Text>
            </View>

            <Text style={styles.performanceValue}>
                {value}
            </Text>
        </View>
    );
}


/* =========================
   STYLES
========================= */

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background
    },

    content: {
        padding: SPACING.md,
        paddingBottom: SPACING.xl * 2
    },

    loadingContainer: {
        flex: 1,
        backgroundColor: COLORS.background,
        justifyContent: "center",
        alignItems: "center"
    },

    loadingText: {
        color: COLORS.textSecondary,
        marginTop: SPACING.md,
        fontSize: 14
    },

    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: SPACING.xl
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
        fontSize: 28,
        fontWeight: "800"
    },

    subtitle: {
        color: COLORS.textSecondary,
        fontSize: 13,
        marginTop: 4
    },

    headerIcon: {
        width: 44,
        height: 44,
        borderRadius: RADIUS.md,
        backgroundColor: "rgba(255, 215, 0, 0.10)",
        borderWidth: 1,
        borderColor: "rgba(255, 215, 0, 0.35)",
        justifyContent: "center",
        alignItems: "center"
    },

    headerIconText: {
        color: COLORS.secondary,
        fontSize: 22,
        fontWeight: "800"
    },

    sectionTitle: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: "800",
        marginTop: SPACING.lg,
        marginBottom: SPACING.sm
    },

    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between"
    },

    statCard: {
        width: "48%",
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: RADIUS.lg,
        padding: SPACING.md,
        marginBottom: SPACING.sm
    },

    statIcon: {
        width: 38,
        height: 38,
        borderRadius: RADIUS.md,
        backgroundColor: "rgba(255, 215, 0, 0.10)",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: SPACING.sm
    },

    statIconText: {
        fontSize: 19
    },

    statValue: {
        color: COLORS.white,
        fontSize: 27,
        fontWeight: "800"
    },

    statTitle: {
        color: COLORS.textSecondary,
        fontSize: 12,
        marginTop: 4
    },

    performanceCard: {
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: RADIUS.lg,
        padding: SPACING.md
    },

    performanceRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between"
    },

    performanceInfo: {
        flex: 1,
        paddingRight: SPACING.md
    },

    performanceLabel: {
        color: COLORS.white,
        fontSize: 15,
        fontWeight: "700"
    },

    performanceDescription: {
        color: COLORS.textSecondary,
        fontSize: 12,
        marginTop: 4,
        lineHeight: 18
    },

    performanceValue: {
        color: COLORS.secondary,
        fontSize: 25,
        fontWeight: "800"
    },

    divider: {
        height: 1,
        backgroundColor: COLORS.border,
        marginVertical: SPACING.md
    },

    moduleCard: {
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: RADIUS.lg,
        padding: SPACING.md,
        marginBottom: SPACING.sm
    },

    moduleHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between"
    },

    moduleInfo: {
        flex: 1,
        paddingRight: SPACING.md
    },

    moduleName: {
        color: COLORS.white,
        fontSize: 15,
        fontWeight: "700"
    },

    moduleId: {
        color: COLORS.textSecondary,
        fontSize: 11,
        marginTop: 3
    },

    moduleRate: {
        color: COLORS.secondary,
        fontSize: 21,
        fontWeight: "800"
    },

    progressBackground: {
        height: 8,
        borderRadius: 8,
        backgroundColor: "rgba(255,255,255,0.08)",
        overflow: "hidden",
        marginTop: SPACING.md
    },

    progressFill: {
        height: "100%",
        backgroundColor: COLORS.secondary,
        borderRadius: 8
    },

    moduleStats: {
        color: COLORS.textSecondary,
        fontSize: 11,
        marginTop: SPACING.sm
    },

    emptyCard: {
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: RADIUS.lg,
        padding: SPACING.xl,
        alignItems: "center"
    },

    emptyIcon: {
        color: COLORS.secondary,
        fontSize: 30,
        marginBottom: SPACING.sm
    },

    emptyTitle: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: "700"
    },

    emptyText: {
        color: COLORS.textSecondary,
        fontSize: 12,
        textAlign: "center",
        lineHeight: 18,
        marginTop: SPACING.xs
    },

    errorCard: {
        backgroundColor: "rgba(239, 68, 68, 0.10)",
        borderWidth: 1,
        borderColor: "rgba(239, 68, 68, 0.35)",
        borderRadius: RADIUS.lg,
        padding: SPACING.md,
        marginBottom: SPACING.md
    },

    errorTitle: {
        color: COLORS.danger,
        fontSize: 15,
        fontWeight: "800"
    },

    errorText: {
        color: COLORS.textSecondary,
        fontSize: 12,
        marginTop: 5,
        lineHeight: 18
    },

    retryButton: {
        alignSelf: "flex-start",
        marginTop: SPACING.sm,
        backgroundColor: COLORS.danger,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderRadius: RADIUS.md
    },

    retryText: {
        color: COLORS.white,
        fontSize: 13,
        fontWeight: "700"
    },

    footer: {
        alignItems: "center",
        marginTop: SPACING.xl
    },

    footerText: {
        color: COLORS.textSecondary,
        fontSize: 11
    }
});

