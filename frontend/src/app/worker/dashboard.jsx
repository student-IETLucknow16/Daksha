import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    ScrollView,
    RefreshControl,
    TouchableOpacity
} from "react-native";

import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { useNetworkStatus } from "../../context/NetworkStatusContext";
import {
    getWorkerDashboard,
    getWorkerProgress,
    getWorkerCertificates,
    getWorkerTrainingHistory,
    getWorkerAssessmentHistory
} from "../../services/workerService";

import {
    COLORS,
    SPACING,
    RADIUS
} from "../../constants/theme";

export default function WorkerDashboard() {
    const router = useRouter();
    const { user, logout } = useAuth();
    const { isOnline } = useNetworkStatus();

    const [dashboard, setDashboard] = useState(null);
const [progress, setProgress] = useState(null);
const [certificates, setCertificates] = useState([]);
const [trainingHistory, setTrainingHistory] = useState([]);
const [assessmentHistory, setAssessmentHistory] = useState([]);

const [loading, setLoading] = useState(true);
const [refreshing, setRefreshing] = useState(false);
const [error, setError] = useState("");

   const loadDashboard = async () => {
    try {
        setError("");

        const [
            dashboardData,
            progressData,
            certificatesData,
            trainingHistoryData,
            assessmentHistoryData
        ] = await Promise.all([
            getWorkerDashboard(),
            getWorkerProgress(),
            getWorkerCertificates(),
            getWorkerTrainingHistory(),
            getWorkerAssessmentHistory()
        ]);

        console.log(
            "WORKER DASHBOARD:",
            dashboardData
        );

        console.log(
            "WORKER PROGRESS:",
            progressData
        );

        console.log(
            "WORKER CERTIFICATES:",
            certificatesData
        );

        console.log(
            "WORKER TRAINING HISTORY:",
            trainingHistoryData
        );

        console.log(
            "WORKER ASSESSMENT HISTORY:",
            assessmentHistoryData
        );

        setDashboard(dashboardData);
        setProgress(progressData);
        setCertificates(
            certificatesData?.certificates || []
        );
        setTrainingHistory(
            trainingHistoryData?.history || []
        );
        setAssessmentHistory(
            assessmentHistoryData?.history || []
        );
    } catch (error) {
        console.error(
            "WORKER DATA ERROR:",
            error
        );

        setError(
            error?.response?.data?.message ||
            "Failed to load worker data."
        );
    } finally {
        setLoading(false);
        setRefreshing(false);
    }
};

    useEffect(() => {
        loadDashboard();
    }, []);

    const handleRefresh = () => {
        setRefreshing(true);
        loadDashboard();
    };

    const handleLogout = async () => {
        await logout();
        router.replace("/(auth)/login");
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator
                    size="large"
                    color={COLORS.secondary}
                />

                <Text style={styles.loadingText}>
                    Loading dashboard...
                </Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.center}>
                <Text style={styles.errorTitle}>
                    Unable to load dashboard
                </Text>

                <Text style={styles.errorText}>
                    {error}
                </Text>

                <TouchableOpacity
                    style={styles.retryButton}
                    onPress={loadDashboard}
                >
                    <Text style={styles.retryText}>
                        TRY AGAIN
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }

    const worker = dashboard?.worker || user;
    const statistics = dashboard?.statistics || {};
    const trainingAttempts =
    statistics.totalTrainingAttempts || 0;

    const completedTraining =
    statistics.completedTraining || 0;

    const passedTraining =
    statistics.passedTraining || 0;

    const trainingProgress =
    trainingAttempts > 0
        ? Math.round(
              (completedTraining / trainingAttempts) * 100
          )
        : 0; 

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
                {/* Offline Status */}
                {!isOnline && (
                    <View style={styles.offlineBanner}>
                        <Text style={styles.offlineBannerText}>
                            You are offline. Saved training data is still available.
                        </Text>
                    </View>
                )}

                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <Text style={styles.greeting}>
                            Welcome back,
                        </Text>

                        <Text style={styles.name}>
                            {worker?.name || "Worker"}
                        </Text>

                        <Text style={styles.site}>
                            📍 {worker?.site || "Mining Site"}
                        </Text>
                    </View>

                    <View style={styles.workerBadge}>
                        <Text style={styles.workerBadgeText}>
                            WORKER
                        </Text>
                    </View>
                </View>

                {/* Training Overview */}
                <Text style={styles.sectionTitle}>
                    Training Overview
                </Text>

                <View style={styles.statsGrid}>
                    <StatCard
                        icon="📚"
                        title="Training Attempts"
                        value={
                            statistics.totalTrainingAttempts || 0
                        }
                    />

                    <StatCard
                        icon="✓"
                        title="Completed"
                        value={
                            statistics.completedTraining || 0
                        }
                    />

                    <StatCard
                        icon="🏆"
                        title="Training Passed"
                        value={
                            statistics.passedTraining || 0
                        }
                    />

                    <StatCard
                        icon="📝"
                        title="Assessments"
                        value={
                            statistics.totalAssessments || 0
                        }
                    />
                </View>

                {/* Training Progress */}
<Text style={styles.sectionTitle}>
    Training Progress
</Text>

<View style={styles.progressCard}>
    <View style={styles.progressHeader}>
        <View>
            <Text style={styles.progressTitle}>
                Overall Training
            </Text>

            <Text style={styles.progressSubtitle}>
                {completedTraining} of {trainingAttempts} completed
            </Text>
        </View>

        <Text style={styles.progressPercentage}>
            {trainingProgress}%
        </Text>
    </View>

    <View style={styles.progressTrack}>
        <View
            style={[
                styles.progressFill,
                {
                    width: `${trainingProgress}%`
                }
            ]}
        />
    </View>

    <View style={styles.progressBottom}>
        <Text style={styles.progressBottomText}>
            {passedTraining} passed
        </Text>

        <Text style={styles.progressBottomText}>
            {statistics.totalAssessments || 0} assessments
        </Text>
    </View>
</View>

                {/* Certification Overview */}
                <Text style={styles.sectionTitle}>
                    Certification
                </Text>
                 {/* My Certificates */}
<Text style={styles.sectionTitle}>
    My Certificates
</Text>

<View style={styles.certificatesCard}>
    {certificates.length === 0 ? (
        <View style={styles.certificateEmpty}>
            <View style={styles.certificateEmptyIcon}>
                <Text>🏆</Text>
            </View>

            <Text style={styles.emptyTitle}>
                No certificates yet
            </Text>

            <Text style={styles.emptyText}>
                Complete your training and assessment
                to earn your first certificate.
            </Text>
        </View>
    ) : (
        certificates.slice(0, 5).map((certificate, index) => (
           <TouchableOpacity
    key={
        certificate._id ||
        certificate.id ||
        index
    }
    style={styles.certificateItem}
    activeOpacity={0.8}
    onPress={() => {
        if (!certificate.certificateId) {
            return;
        }

        router.push({
            pathname: "/worker/certificate",
            params: {
                certificateId: certificate.certificateId,
                moduleId: certificate.moduleId || "",
                scenarioScore: String(
                    certificate.scenarioScore ?? 0
                ),
                quizScore: String(
                    certificate.quizScore ?? 0
                ),
                finalScore: String(
                    certificate.finalScore ?? 0
                ),
                verificationStatus:
                    certificate.verificationStatus || "",
                blockchainTransactionId:
                    certificate.blockchainTransactionId || ""
            }
        });
    }}
>
                <View style={styles.certificateIcon}>
                    <Text>🏆</Text>
                </View>

                <View style={styles.certificateContent}>
                    <Text style={styles.certificateTitle}>
                        {certificate.moduleId ||
                            "Safety Training Certificate"}
                    </Text>

                    <Text style={styles.certificateId}>
                        ID:{" "}
                        {certificate.certificateId ||
                            "Not available"}
                    </Text>

                    <Text style={styles.certificateScore}>
                        Final Score:{" "}
                        {certificate.finalScore ?? 0}%
                    </Text>
                </View>

                <View
                    style={[
                        styles.verificationBadge,
                        certificate.verificationStatus ===
                            "verified"
                            ? styles.verifiedBadge
                            : styles.pendingBadge
                    ]}
                >
                    <Text
                        style={[
                            styles.verificationText,
                            certificate.verificationStatus ===
                                "verified"
                                ? styles.verifiedText
                                : styles.pendingText
                        ]}
                    >
                        {certificate.verificationStatus ===
                        "verified"
                            ? "VERIFIED"
                            : "PENDING"}
                    </Text>
                </View>
            </TouchableOpacity>
        ))
    )}
</View>

            {/* Assessment History */}
<Text style={styles.sectionTitle}>
    Assessment History
</Text>

<View style={styles.assessmentCard}>
    {assessmentHistory.length === 0 ? (
        <View style={styles.certificateEmpty}>
            <View style={styles.assessmentEmptyIcon}>
                <Text>📝</Text>
            </View>

            <Text style={styles.emptyTitle}>
                No assessments yet
            </Text>

            <Text style={styles.emptyText}>
                Complete a training assessment to see
                your quiz results here.
            </Text>
        </View>
    ) : (
        assessmentHistory
            .slice(0, 5)
            .map((assessment, index) => (
                <View
                    key={
                        assessment._id ||
                        assessment.id ||
                        index
                    }
                    style={styles.assessmentItem}
                >
                    <View style={styles.assessmentIcon}>
                        <Text>📝</Text>
                    </View>

                    <View style={styles.assessmentContent}>
                        <Text style={styles.assessmentTitle}>
                            {assessment.moduleId ||
                                "Safety Assessment"}
                        </Text>

                        <Text style={styles.assessmentScore}>
                            Score:{" "}
                            {assessment.quizScore ?? 0}%
                        </Text>
                    </View>

                    <View
                        style={[
                            styles.assessmentBadge,
                            assessment.passed
                                ? styles.assessmentPassed
                                : styles.assessmentFailed
                        ]}
                    >
                        <Text
                            style={[
                                styles.assessmentBadgeText,
                                assessment.passed
                                    ? styles.assessmentPassedText
                                    : styles.assessmentFailedText
                            ]}
                        >
                            {assessment.passed
                                ? "PASSED"
                                : "FAILED"}
                        </Text>
                    </View>
                </View>
            ))
    )}
</View>

                <View style={styles.certificationCard}>
                    <View style={styles.certificationItem}>
                        <Text style={styles.certificationNumber}>
                            {statistics.totalCertificates || 0}
                        </Text>

                        <Text style={styles.certificationLabel}>
                            Certificates
                        </Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.certificationItem}>
                        <Text
                            style={[
                                styles.certificationNumber,
                                styles.successNumber
                            ]}
                        >
                            {statistics.verifiedCertificates || 0}
                        </Text>

                        <Text style={styles.certificationLabel}>
                            Blockchain Verified
                        </Text>
                    </View>
                </View>

                {/* Quick Actions */}
                <Text style={styles.sectionTitle}>
                    Quick Actions
                </Text>

                <View style={styles.actionsCard}>
                   <TouchableOpacity
    style={styles.actionButton}
    activeOpacity={0.8}
    onPress={() => router.push("/worker/training")}
>
    <View style={styles.actionIcon}>
        <Text>🎯</Text>
    </View>

    <View style={styles.actionContent}>
        <Text style={styles.actionTitle}>
            Start Training
        </Text>

        <Text style={styles.actionSubtitle}>
            Begin your AR safety training
        </Text>
    </View>

    <Text style={styles.actionArrow}>
        →
    </Text>
</TouchableOpacity>

                    <View style={styles.actionSeparator} />

                    <TouchableOpacity
                        style={styles.actionButton}
                        activeOpacity={0.8}
                         onPress={() => router.push("/worker/certificate")}
                    >
                        <View style={styles.actionIcon}>
                            <Text>🏅</Text>
                        </View>

                        <View style={styles.actionContent}>
                            <Text style={styles.actionTitle}>
                                My Certificates
                            </Text>

                            <Text style={styles.actionSubtitle}>
                                View your verified certificates
                            </Text>
                        </View>

                        <Text style={styles.actionArrow}>
                            →
                        </Text>
                    </TouchableOpacity>
                </View>

               {/* Recent Training */}
<Text style={styles.sectionTitle}>
    Recent Training
</Text>

<View style={styles.activityCard}>
    {trainingHistory.length === 0 ? (
        <>
            <View style={styles.emptyIcon}>
                <Text>📚</Text>
            </View>

            <Text style={styles.emptyTitle}>
                No training completed
            </Text>

            <Text style={styles.emptyText}>
                Your completed training modules will
                appear here.
            </Text>
        </>
    ) : (
        trainingHistory
            .slice(0, 5)
            .map((attempt, index) => (
                <View
                    key={
                        attempt._id ||
                        attempt.id ||
                        index
                    }
                    style={styles.historyItem}
                >
                    <View style={styles.historyIcon}>
                        <Text>
                            {attempt.passed ? "✓" : "📚"}
                        </Text>
                    </View>

                    <View style={styles.historyContent}>
                        <Text style={styles.historyTitle}>
                            {attempt.moduleId ||
                                "Training Module"}
                        </Text>

                        <Text style={styles.historySubtitle}>
                            Score:{" "}
                            {attempt.scenarioScore ?? 0}%
                        </Text>
                    </View>

                    <View
                        style={[
                            styles.resultBadge,
                            attempt.passed
                                ? styles.resultPassed
                                : styles.resultFailed
                        ]}
                    >
                        <Text
                            style={[
                                styles.resultText,
                                attempt.passed
                                    ? styles.resultPassedText
                                    : styles.resultFailedText
                            ]}
                        >
                            {attempt.passed
                                ? "PASSED"
                                : "FAILED"}
                        </Text>
                    </View>
                </View>
            ))
    )}
</View>

                <View style={styles.activityCard}>
                    {dashboard?.recentTraining?.length > 0 ||
                    dashboard?.recentAssessments?.length > 0 ||
                    dashboard?.recentCertificates?.length > 0 ? (
                        <Text style={styles.activityText}>
                            Recent activity will appear here.
                        </Text>
                    ) : (
                        <>
                            <View style={styles.emptyIcon}>
                                <Text>📋</Text>
                            </View>

                            <Text style={styles.emptyTitle}>
                                No activity yet
                            </Text>

                            <Text style={styles.emptyText}>
                                Complete your first training module
                                to see your activity here.
                            </Text>
                        </>
                    )}
                </View>

                {/* Logout */}
                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={handleLogout}
                    activeOpacity={0.8}
                >
                    <Text style={styles.logoutText}>
                        LOGOUT
                    </Text>
                </TouchableOpacity>

                {/* Footer */}
                <Text style={styles.footer}>
                    AR-Based Mining Safety & Certification
                </Text>

                <Text style={styles.footerSmall}>
                    SIH 2026 • Problem Statement 26041
                </Text>
            </ScrollView>
        </View>
    );
}

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

const styles = StyleSheet.create({
    offlineBanner: {
        marginBottom: 12,
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 10,
        backgroundColor: "#7C2D12",
        borderWidth: 1,
        borderColor: "#F59E0B"
    },

    offlineBannerText: {
        color: "#FFFFFF",
        fontSize: 12,
        fontWeight: "700",
        textAlign: "center"
    },

    container: {
        flex: 1,
        backgroundColor: COLORS.background
    },

    content: {
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.lg,
        paddingBottom: 40
    },

    center: {
        flex: 1,
        backgroundColor: COLORS.background,
        alignItems: "center",
        justifyContent: "center",
        padding: SPACING.lg
    },

    loadingText: {
        color: COLORS.textSecondary,
        marginTop: SPACING.md,
        fontSize: 14
    },

    certificatesCard: {
    backgroundColor: "rgba(11, 43, 106, 0.55)",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg
},

certificateEmpty: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20
},

certificateEmptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255, 215, 0, 0.10)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10
},

certificateItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
},

certificateIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 215, 0, 0.10)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10
},

certificateContent: {
    flex: 1
},

certificateTitle: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "800"
},

certificateId: {
    color: COLORS.textSecondary,
    fontSize: 10,
    marginTop: 3
},

certificateScore: {
    color: COLORS.secondary,
    fontSize: 11,
    fontWeight: "700",
    marginTop: 3
},

verificationBadge: {
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1
},

verifiedBadge: {
    backgroundColor: "rgba(34, 197, 94, 0.10)",
    borderColor: COLORS.success
},

pendingBadge: {
    backgroundColor: "rgba(245, 158, 11, 0.10)",
    borderColor: COLORS.warning
},

verificationText: {
    fontSize: 8,
    fontWeight: "900"
},

verifiedText: {
    color: COLORS.success
},

pendingText: {
    color: COLORS.warning
},

assessmentCard: {
    backgroundColor: "rgba(11, 43, 106, 0.55)",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg
},

assessmentEmptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(77, 166, 255, 0.10)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10
},

assessmentItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
},

assessmentIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(77, 166, 255, 0.10)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10
},

assessmentContent: {
    flex: 1
},

assessmentTitle: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "800"
},

assessmentScore: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 4
},

assessmentBadge: {
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1
},

assessmentPassed: {
    backgroundColor: "rgba(34, 197, 94, 0.10)",
    borderColor: COLORS.success
},

assessmentFailed: {
    backgroundColor: "rgba(239, 68, 68, 0.10)",
    borderColor: COLORS.danger
},

assessmentBadgeText: {
    fontSize: 8,
    fontWeight: "900"
},

assessmentPassedText: {
    color: COLORS.success
},

assessmentFailedText: {
    color: COLORS.danger
},

    errorTitle: {
        color: COLORS.danger,
        fontSize: 20,
        fontWeight: "800",
        textAlign: "center"
    },

    errorText: {
        color: COLORS.textSecondary,
        fontSize: 14,
        textAlign: "center",
        marginTop: SPACING.sm
    },

    retryButton: {
        marginTop: SPACING.lg,
        paddingHorizontal: 24,
        paddingVertical: 13,
        borderRadius: RADIUS.md,
        backgroundColor: COLORS.secondary
    },

    retryText: {
        color: COLORS.background,
        fontWeight: "900",
        fontSize: 13
    },

    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: SPACING.xl
    },

    headerLeft: {
        flex: 1
    },

    greeting: {
        color: COLORS.textSecondary,
        fontSize: 14
    },

    name: {
        color: COLORS.white,
        fontSize: 28,
        fontWeight: "900",
        marginTop: 3
    },

    site: {
        color: COLORS.textSecondary,
        fontSize: 12,
        marginTop: 7
    },

    workerBadge: {
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: RADIUS.md,
        borderWidth: 1,
        borderColor: COLORS.secondary,
        backgroundColor: "rgba(255, 215, 0, 0.08)"
    },

    workerBadgeText: {
        color: COLORS.secondary,
        fontSize: 10,
        fontWeight: "900"
    },

    sectionTitle: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: "800",
        marginBottom: SPACING.md,
        marginTop: SPACING.sm
    },

    statsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        marginBottom: SPACING.lg
    },

    statCard: {
        width: "48.5%",
        minHeight: 135,
        backgroundColor: "rgba(11, 43, 106, 0.55)",
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: RADIUS.lg,
        padding: SPACING.md,
        marginBottom: 10
    },

    statIcon: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: "rgba(255, 215, 0, 0.10)",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 8
    },

    statIconText: {
        fontSize: 18,
        color: COLORS.secondary
    },

    statValue: {
        color: COLORS.white,
        fontSize: 27,
        fontWeight: "900"
    },

    statTitle: {
        color: COLORS.textSecondary,
        fontSize: 12,
        marginTop: 3
    },

    certificationCard: {
        flexDirection: "row",
        backgroundColor: "rgba(11, 43, 106, 0.55)",
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: RADIUS.lg,
        paddingVertical: 20,
        marginBottom: SPACING.lg
    },

    certificationItem: {
        flex: 1,
        alignItems: "center"
    },

    certificationNumber: {
        color: COLORS.secondary,
        fontSize: 30,
        fontWeight: "900"
    },

    successNumber: {
        color: COLORS.success
    },

    certificationLabel: {
        color: COLORS.textSecondary,
        fontSize: 12,
        marginTop: 4,
        textAlign: "center"
    },

    divider: {
        width: 1,
        backgroundColor: COLORS.border
    },

    actionsCard: {
        backgroundColor: "rgba(11, 43, 106, 0.55)",
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: RADIUS.lg,
        marginBottom: SPACING.lg,
        overflow: "hidden"
    },

    actionButton: {
        minHeight: 76,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: SPACING.md
    },

    actionIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "rgba(255, 215, 0, 0.10)",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12
    },

    actionContent: {
        flex: 1
    },

    actionTitle: {
        color: COLORS.white,
        fontSize: 15,
        fontWeight: "800"
    },

    actionSubtitle: {
        color: COLORS.textSecondary,
        fontSize: 11,
        marginTop: 3
    },

    actionArrow: {
        color: COLORS.secondary,
        fontSize: 24,
        fontWeight: "700"
    },

    actionSeparator: {
        height: 1,
        backgroundColor: COLORS.border,
        marginLeft: 70
    },

    activityCard: {
        minHeight: 150,
        backgroundColor: "rgba(11, 43, 106, 0.55)",
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: RADIUS.lg,
        alignItems: "center",
        justifyContent: "center",
        padding: SPACING.lg,
        marginBottom: SPACING.lg
    },

    emptyIcon: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 10
    },

    emptyTitle: {
        color: COLORS.white,
        fontSize: 15,
        fontWeight: "800"
    },

    emptyText: {
        color: COLORS.textSecondary,
        fontSize: 12,
        textAlign: "center",
        lineHeight: 18,
        marginTop: 5,
        maxWidth: 300
    },

    activityText: {
        color: COLORS.textSecondary,
        fontSize: 13
    },

    logoutButton: {
        height: 50,
        borderWidth: 1,
        borderColor: COLORS.danger,
        borderRadius: RADIUS.md,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 4
    },

    progressCard: {
    backgroundColor: "rgba(11, 43, 106, 0.55)",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg
},

progressHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
},

progressTitle: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "800"
},

progressSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 4
},

progressPercentage: {
    color: COLORS.secondary,
    fontSize: 25,
    fontWeight: "900"
},

progressTrack: {
    height: 10,
    borderRadius: 5,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    overflow: "hidden",
    marginTop: 18
},

progressFill: {
    height: "100%",
    backgroundColor: COLORS.secondary,
    borderRadius: 5
},

progressBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10
},

progressBottomText: {
    color: COLORS.textSecondary,
    fontSize: 11
},

historyItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
},

historyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 215, 0, 0.10)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10
},

historyContent: {
    flex: 1
},

historyTitle: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "700"
},

historySubtitle: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 3
},

resultBadge: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1
},

resultPassed: {
    borderColor: COLORS.success,
    backgroundColor: "rgba(34, 197, 94, 0.10)"
},

resultFailed: {
    borderColor: COLORS.danger,
    backgroundColor: "rgba(239, 68, 68, 0.10)"
},

resultText: {
    fontSize: 9,
    fontWeight: "900"
},

resultPassedText: {
    color: COLORS.success
},

resultFailedText: {
    color: COLORS.danger
},

    logoutText: {
        color: COLORS.danger,
        fontSize: 13,
        fontWeight: "900",
        letterSpacing: 0.5
    },

    footer: {
        color: "#6F7F99",
        fontSize: 11,
        textAlign: "center",
        marginTop: 25
    },

    footerSmall: {
        color: "#4E5C73",
        fontSize: 10,
        textAlign: "center",
        marginTop: 5
    }
});

