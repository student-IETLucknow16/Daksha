
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

import { useAuth } from "../../context/AuthContext";
import { getSiteOfficerDashboard } from "../../services/siteOfficerService";

import {
    COLORS,
    RADIUS,
    SPACING
} from "../../constants/theme";

export default function SiteOfficerDashboard() {
    const router = useRouter();
    const { user, logout } = useAuth();

    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    const loadDashboard = async () => {
        try {
            setError("");

            const data = await getSiteOfficerDashboard();

            console.log("SITE OFFICER DASHBOARD:", data);

            setDashboard(data);
        } catch (err) {
            console.error(
                "SITE OFFICER DASHBOARD ERROR:",
                err
            );

            setError(
                err?.response?.data?.message ||
                "Unable to load site officer dashboard."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadDashboard();
    }, []);

    const handleRefresh = useCallback(() => {
        setRefreshing(true);
        loadDashboard();
    }, []);

    const handleLogout = async () => {
        try {
            await logout();

            router.replace("/(auth)/login");
        } catch (err) {
            console.error("Logout error:", err);
        }
    };

    /*
     * Support the response structures commonly returned
     * by the backend without changing the backend.
     */
    const statistics =
        dashboard?.statistics ||
        dashboard?.stats ||
        dashboard?.summary ||
        {};

    const totalWorkers =
        statistics.totalWorkers ??
        dashboard?.totalWorkers ??
        0;

    const activeWorkers =
        statistics.activeWorkers ??
        dashboard?.activeWorkers ??
        0;

    const trainingAttempts =
        statistics.trainingAttempts ??
        statistics.totalTrainingAttempts ??
        dashboard?.trainingAttempts ??
        dashboard?.totalTrainingAttempts ??
        0;

    const completedTraining =
        statistics.completedTraining ??
        statistics.completedTrainingAttempts ??
        dashboard?.completedTraining ??
        0;

    const assessments =
        statistics.assessments ??
        statistics.totalAssessments ??
        dashboard?.assessments ??
        dashboard?.totalAssessments ??
        0;

    const passedAssessments =
        statistics.passedAssessments ??
        dashboard?.passedAssessments ??
        0;

    const certificates =
        statistics.certificates ??
        statistics.totalCertificates ??
        dashboard?.certificates ??
        dashboard?.totalCertificates ??
        0;

    const verifiedCertificates =
        statistics.verifiedCertificates ??
        dashboard?.verifiedCertificates ??
        0;

    const trainingCompletionRate =
        trainingAttempts > 0
            ? Math.round(
                (completedTraining / trainingAttempts) * 100
            )
            : 0;

    const assessmentPassRate =
        assessments > 0
            ? Math.round(
                (passedAssessments / assessments) * 100
            )
            : 0;

    const certificateVerificationRate =
        certificates > 0
            ? Math.round(
                (verifiedCertificates / certificates) * 100
            )
            : 0;

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator
                    size="large"
                    color={COLORS.secondary}
                />

                <Text style={styles.loadingText}>
                    Loading site dashboard...
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.content}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        tintColor={COLORS.secondary}
                    />
                }
            >
                {/* ================= HEADER ================= */}

                <View style={styles.header}>
                    <View style={styles.headerContent}>
                        <Text style={styles.welcomeText}>
                            Site Officer
                        </Text>

                        <Text style={styles.title}>
                            {user?.name || "Site Officer"}
                        </Text>

                        <Text style={styles.subtitle}>
                            Monitor worker safety and training
                        </Text>
                    </View>

                    <View style={styles.roleBadge}>
                        <Text style={styles.roleBadgeText}>
                            OFFICER
                        </Text>
                    </View>
                </View>

                {/* ================= ERROR ================= */}

                {error ? (
                    <View style={styles.errorCard}>
                        <Text style={styles.errorTitle}>
                            Dashboard Error
                        </Text>

                        <Text style={styles.errorText}>
                            {error}
                        </Text>

                        <TouchableOpacity
                            style={styles.retryButton}
                            onPress={loadDashboard}
                        >
                            <Text style={styles.retryText}>
                                Retry
                            </Text>
                        </TouchableOpacity>
                    </View>
                ) : null}

                {/* ================= SITE INFO ================= */}

                <View style={styles.siteCard}>
                    <View style={styles.siteIcon}>
                        <Text style={styles.siteIconText}>
                            ⛏
                        </Text>
                    </View>

                    <View style={styles.siteInfo}>
                        <Text style={styles.siteLabel}>
                            ASSIGNED SITE
                        </Text>

                        <Text style={styles.siteName}>
                            {user?.site || "Assigned Mining Site"}
                        </Text>

                        <Text style={styles.siteDescription}>
                            Worker activity is restricted to your
                            assigned site.
                        </Text>
                    </View>
                </View>

                {/* ================= OVERVIEW ================= */}

                <Text style={styles.sectionTitle}>
                    Site Overview
                </Text>

                <View style={styles.statsGrid}>
                    <StatCard
                        icon="👥"
                        title="Total Workers"
                        value={totalWorkers}
                    />

                    <StatCard
                        icon="✓"
                        title="Active Workers"
                        value={activeWorkers}
                    />

                    <StatCard
                        icon="🎯"
                        title="Training Attempts"
                        value={trainingAttempts}
                    />

                    <StatCard
                        icon="🏆"
                        title="Certificates"
                        value={certificates}
                    />
                </View>

                {/* ================= TRAINING ================= */}

                <Text style={styles.sectionTitle}>
                    Training Performance
                </Text>

                <View style={styles.performanceCard}>
                    <View style={styles.performanceHeader}>
                        <View>
                            <Text style={styles.performanceTitle}>
                                Training Completion
                            </Text>

                            <Text style={styles.performanceSubtitle}>
                                {completedTraining} of{" "}
                                {trainingAttempts} attempts completed
                            </Text>
                        </View>

                        <Text style={styles.performanceValue}>
                            {trainingCompletionRate}%
                        </Text>
                    </View>

                    <View style={styles.progressBackground}>
                        <View
                            style={[
                                styles.progressFill,
                                {
                                    width: `${trainingCompletionRate}%`
                                }
                            ]}
                        />
                    </View>
                </View>

                {/* ================= ASSESSMENTS ================= */}

                <Text style={styles.sectionTitle}>
                    Assessment Performance
                </Text>

                <View style={styles.performanceCard}>
                    <View style={styles.performanceHeader}>
                        <View>
                            <Text style={styles.performanceTitle}>
                                Assessment Pass Rate
                            </Text>

                            <Text style={styles.performanceSubtitle}>
                                {passedAssessments} of{" "}
                                {assessments} assessments passed
                            </Text>
                        </View>

                        <Text style={styles.performanceValue}>
                            {assessmentPassRate}%
                        </Text>
                    </View>

                    <View style={styles.progressBackground}>
                        <View
                            style={[
                                styles.progressFill,
                                {
                                    width: `${assessmentPassRate}%`
                                }
                            ]}
                        />
                    </View>
                </View>

                {/* ================= CERTIFICATION ================= */}

                <Text style={styles.sectionTitle}>
                    Certification
                </Text>

                <View style={styles.performanceCard}>
                    <View style={styles.performanceHeader}>
                        <View>
                            <Text style={styles.performanceTitle}>
                                Blockchain Verification
                            </Text>

                            <Text style={styles.performanceSubtitle}>
                                {verifiedCertificates} of{" "}
                                {certificates} certificates verified
                            </Text>
                        </View>

                        <Text style={styles.performanceValue}>
                            {certificateVerificationRate}%
                        </Text>
                    </View>

                    <View style={styles.progressBackground}>
                        <View
                            style={[
                                styles.progressFill,
                                {
                                    width: `${certificateVerificationRate}%`
                                }
                            ]}
                        />
                    </View>
                </View>

                {/* ================= ACTIONS ================= */}

                <Text style={styles.sectionTitle}>
                    Site Management
                </Text>

                <View style={styles.actionsContainer}>
                    <ActionButton
                        icon="👥"
                        title="Workers"
                        description="View workers at your site"
                        onPress={() =>
                            router.push("/site-officer/workers")
                        }
                    />

                    <ActionButton
                        icon="🎯"
                        title="Training"
                        description="Monitor training activity"
                        onPress={() =>
                            router.push("/site-officer/training")
                        }
                    />

                    <ActionButton
                        icon="📝"
                        title="Assessments"
                        description="Review assessment results"
                        onPress={() =>
                            router.push("/site-officer/assessments")
                        }
                    />

                    <ActionButton
                        icon="🏆"
                        title="Certifications"
                        description="View worker certificates"
                        onPress={() =>
                            router.push("/site-officer/certifications")
                        }
                    />

                    <ActionButton
                        icon="📊"
                        title="Analytics"
                        description="View site performance"
                        onPress={() =>
                            router.push("/site-officer/analytics")
                        }
                    />
                </View>

                {/* ================= LOGOUT ================= */}

                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={handleLogout}
                >
                    <Text style={styles.logoutText}>
                        Logout
                    </Text>
                </TouchableOpacity>

                {/* ================= FOOTER ================= */}

                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        SIH26041 • Site Officer Console
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}


/* =====================================================
   STAT CARD
===================================================== */

function StatCard({
    icon,
    title,
    value
}) {
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


/* =====================================================
   ACTION BUTTON
===================================================== */

function ActionButton({
    icon,
    title,
    description,
    onPress
}) {
    return (
        <TouchableOpacity
            style={styles.actionButton}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <View style={styles.actionIcon}>
                <Text style={styles.actionIconText}>
                    {icon}
                </Text>
            </View>

            <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>
                    {title}
                </Text>

                <Text style={styles.actionDescription}>
                    {description}
                </Text>
            </View>

            <Text style={styles.actionArrow}>
                ›
            </Text>
        </TouchableOpacity>
    );
}


/* =====================================================
   STYLES
===================================================== */

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

    /* HEADER */

    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: SPACING.lg
    },

    headerContent: {
        flex: 1
    },

    welcomeText: {
        color: COLORS.secondary,
        fontSize: 13,
        fontWeight: "700",
        letterSpacing: 1
    },

    title: {
        color: COLORS.white,
        fontSize: 28,
        fontWeight: "800",
        marginTop: 4
    },

    subtitle: {
        color: COLORS.textSecondary,
        fontSize: 13,
        marginTop: 5
    },

    roleBadge: {
        backgroundColor: "rgba(255, 215, 0, 0.10)",
        borderWidth: 1,
        borderColor: "rgba(255, 215, 0, 0.35)",
        borderRadius: RADIUS.md,
        paddingHorizontal: 10,
        paddingVertical: 7
    },

    roleBadgeText: {
        color: COLORS.secondary,
        fontSize: 10,
        fontWeight: "800",
        letterSpacing: 1
    },

    /* ERROR */

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

    /* SITE */

    siteCard: {
        flexDirection: "row",
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: RADIUS.lg,
        padding: SPACING.md
    },

    siteIcon: {
        width: 48,
        height: 48,
        borderRadius: RADIUS.md,
        backgroundColor: "rgba(255, 215, 0, 0.10)",
        justifyContent: "center",
        alignItems: "center",
        marginRight: SPACING.md
    },

    siteIconText: {
        fontSize: 24
    },

    siteInfo: {
        flex: 1
    },

    siteLabel: {
        color: COLORS.secondary,
        fontSize: 10,
        fontWeight: "800",
        letterSpacing: 1
    },

    siteName: {
        color: COLORS.white,
        fontSize: 17,
        fontWeight: "800",
        marginTop: 3
    },

    siteDescription: {
        color: COLORS.textSecondary,
        fontSize: 11,
        lineHeight: 17,
        marginTop: 4
    },

    /* SECTIONS */

    sectionTitle: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: "800",
        marginTop: SPACING.lg,
        marginBottom: SPACING.sm
    },

    /* STATS */

    statsGrid: {
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
        fontSize: 18
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

    /* PERFORMANCE */

    performanceCard: {
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: RADIUS.lg,
        padding: SPACING.md
    },

    performanceHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between"
    },

    performanceTitle: {
        color: COLORS.white,
        fontSize: 15,
        fontWeight: "700"
    },

    performanceSubtitle: {
        color: COLORS.textSecondary,
        fontSize: 11,
        marginTop: 4
    },

    performanceValue: {
        color: COLORS.secondary,
        fontSize: 25,
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

    /* ACTIONS */

    actionsContainer: {
        gap: SPACING.sm
    },

    actionButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: RADIUS.lg,
        padding: SPACING.md
    },

    actionIcon: {
        width: 44,
        height: 44,
        borderRadius: RADIUS.md,
        backgroundColor: "rgba(255, 215, 0, 0.10)",
        justifyContent: "center",
        alignItems: "center",
        marginRight: SPACING.md
    },

    actionIconText: {
        fontSize: 20
    },

    actionContent: {
        flex: 1
    },

    actionTitle: {
        color: COLORS.white,
        fontSize: 15,
        fontWeight: "700"
    },

    actionDescription: {
        color: COLORS.textSecondary,
        fontSize: 11,
        marginTop: 3
    },

    actionArrow: {
        color: COLORS.secondary,
        fontSize: 28,
        fontWeight: "300"
    },

    /* LOGOUT */

    logoutButton: {
        marginTop: SPACING.xl,
        borderWidth: 1,
        borderColor: "rgba(239, 68, 68, 0.45)",
        backgroundColor: "rgba(239, 68, 68, 0.08)",
        borderRadius: RADIUS.md,
        paddingVertical: SPACING.md,
        alignItems: "center"
    },

    logoutText: {
        color: COLORS.danger,
        fontSize: 14,
        fontWeight: "800"
    },

    /* FOOTER */

    footer: {
        alignItems: "center",
        marginTop: SPACING.xl
    },

    footerText: {
        color: COLORS.textSecondary,
        fontSize: 11
    }
});

