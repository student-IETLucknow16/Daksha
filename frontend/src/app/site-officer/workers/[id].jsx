
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

import { useLocalSearchParams, useRouter } from "expo-router";

import { getSiteOfficerWorker } from "../../../services/siteOfficerService";

import {
    COLORS,
    RADIUS,
    SPACING
} from "../../../constants/theme";

export default function SiteOfficerWorkerDetails() {
    const router = useRouter();

    const { id } = useLocalSearchParams();

    const workerId = Array.isArray(id) ? id[0] : id;

    const [worker, setWorker] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    const loadWorker = async () => {
        try {
            setError("");

            if (!workerId) {
                setError("Worker ID is missing.");
                return;
            }

            const data = await getSiteOfficerWorker(workerId);

            console.log(
                "SITE OFFICER WORKER DETAILS:",
                data
            );

            setWorker(
                data?.worker ||
                data?.user ||
                data?.data ||
                null
            );
        } catch (err) {
            console.error(
                "SITE OFFICER WORKER DETAILS ERROR:",
                err
            );

            setError(
                err?.response?.data?.message ||
                "Unable to load worker details."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadWorker();
    }, [workerId]);

    const handleRefresh = useCallback(() => {
        setRefreshing(true);
        loadWorker();
    }, [workerId]);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator
                    size="large"
                    color={COLORS.secondary}
                />

                <Text style={styles.loadingText}>
                    Loading worker details...
                </Text>
            </View>
        );
    }

    if (error || !worker) {
        return (
            <View style={styles.errorContainer}>
                <View style={styles.errorIcon}>
                    <Text style={styles.errorIconText}>
                        !
                    </Text>
                </View>

                <Text style={styles.errorTitle}>
                    Worker Not Available
                </Text>

                <Text style={styles.errorText}>
                    {error || "Worker details could not be found."}
                </Text>

                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() =>
                        router.replace(
                            "/site-officer/workers"
                        )
                    }
                >
                    <Text style={styles.backButtonText}>
                        Back to Workers
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }

    const workerName =
        worker.name ||
        "Unnamed Worker";

    const email =
        worker.email ||
        "Not available";

    const phone =
        worker.phone ||
        "Not available";

    const site =
        worker.site ||
        "Not assigned";

    const language =
        worker.preferredLanguage ||
        worker.language ||
        "en";

    const role =
        worker.role ||
        "worker";

    const isActive =
        worker.isActive !== false;

    const createdAt =
        worker.createdAt
            ? new Date(worker.createdAt).toLocaleDateString()
            : "Not available";

    /*
     * These fields are supported if the backend returns them.
     * Otherwise the UI safely displays 0.
     */
    const totalTrainingAttempts =
        worker.totalTrainingAttempts ??
        worker.trainingAttempts ??
        worker.training?.totalAttempts ??
        0;

    const completedTraining =
        worker.completedTraining ??
        worker.training?.completed ??
        0;

    const passedTraining =
        worker.passedTraining ??
        worker.training?.passed ??
        0;

    const totalAssessments =
        worker.totalAssessments ??
        worker.assessments?.total ??
        0;

    const passedAssessments =
        worker.passedAssessments ??
        worker.assessments?.passed ??
        0;

    const totalCertificates =
        worker.totalCertificates ??
        worker.certificates?.total ??
        0;

    const verifiedCertificates =
        worker.verifiedCertificates ??
        worker.certificates?.verified ??
        0;

    const trainingPassRate =
        totalTrainingAttempts > 0
            ? Math.round(
                (passedTraining /
                    totalTrainingAttempts) *
                100
            )
            : 0;

    const assessmentPassRate =
        totalAssessments > 0
            ? Math.round(
                (passedAssessments /
                    totalAssessments) *
                100
            )
            : 0;

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
                    <TouchableOpacity
                        style={styles.headerBackButton}
                        onPress={() =>
                            router.replace(
                                "/site-officer/workers"
                            )
                        }
                    >
                        <Text style={styles.headerBackText}>
                            ‹
                        </Text>
                    </TouchableOpacity>

                    <View style={styles.headerTextContainer}>
                        <Text style={styles.headerTitle}>
                            Worker Details
                        </Text>

                        <Text style={styles.headerSubtitle}>
                            Site worker profile
                        </Text>
                    </View>
                </View>

                {/* ================= PROFILE ================= */}

                <View style={styles.profileCard}>
                    <View style={styles.profileTop}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>
                                {workerName
                                    .charAt(0)
                                    .toUpperCase()}
                            </Text>
                        </View>

                        <View style={styles.profileInfo}>
                            <Text style={styles.workerName}>
                                {workerName}
                            </Text>

                            <Text style={styles.workerRole}>
                                {role.toUpperCase()}
                            </Text>
                        </View>

                        <View
                            style={[
                                styles.statusBadge,
                                isActive
                                    ? styles.activeBadge
                                    : styles.inactiveBadge
                            ]}
                        >
                            <View
                                style={[
                                    styles.statusDot,
                                    isActive
                                        ? styles.activeDot
                                        : styles.inactiveDot
                                ]}
                            />

                            <Text
                                style={[
                                    styles.statusText,
                                    isActive
                                        ? styles.activeText
                                        : styles.inactiveText
                                ]}
                            >
                                {isActive
                                    ? "Active"
                                    : "Inactive"}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.profileDivider} />

                    <InfoRow
                        label="Email"
                        value={email}
                    />

                    <InfoRow
                        label="Phone"
                        value={phone}
                    />

                    <InfoRow
                        label="Assigned Site"
                        value={site}
                    />

                    <InfoRow
                        label="Language"
                        value={language.toUpperCase()}
                    />

                    <InfoRow
                        label="Joined"
                        value={createdAt}
                        last
                    />
                </View>

                {/* ================= TRAINING ================= */}

                <Text style={styles.sectionTitle}>
                    Training Overview
                </Text>

                <View style={styles.statsGrid}>
                    <StatCard
                        title="Attempts"
                        value={totalTrainingAttempts}
                        icon="🎯"
                    />

                    <StatCard
                        title="Completed"
                        value={completedTraining}
                        icon="✓"
                    />

                    <StatCard
                        title="Passed"
                        value={passedTraining}
                        icon="🏅"
                    />

                    <StatCard
                        title="Pass Rate"
                        value={`${trainingPassRate}%`}
                        icon="📈"
                    />
                </View>

                {/* ================= ASSESSMENTS ================= */}

                <Text style={styles.sectionTitle}>
                    Assessment Overview
                </Text>

                <View style={styles.statsGrid}>
                    <StatCard
                        title="Attempts"
                        value={totalAssessments}
                        icon="📝"
                    />

                    <StatCard
                        title="Passed"
                        value={passedAssessments}
                        icon="✓"
                    />

                    <StatCard
                        title="Pass Rate"
                        value={`${assessmentPassRate}%`}
                        icon="📊"
                    />
                </View>

                {/* ================= CERTIFICATES ================= */}

                <Text style={styles.sectionTitle}>
                    Certification
                </Text>

                <View style={styles.certificateCard}>
                    <View style={styles.certificateIcon}>
                        <Text style={styles.certificateIconText}>
                            🏆
                        </Text>
                    </View>

                    <View style={styles.certificateInfo}>
                        <Text style={styles.certificateTitle}>
                            Certificates
                        </Text>

                        <Text style={styles.certificateSubtitle}>
                            {totalCertificates} issued
                        </Text>
                    </View>

                    <View style={styles.certificateStats}>
                        <Text style={styles.certificateVerified}>
                            {verifiedCertificates}
                        </Text>

                        <Text style={styles.certificateVerifiedLabel}>
                            Verified
                        </Text>
                    </View>
                </View>

                {/* ================= WORKER ID ================= */}

                <Text style={styles.sectionTitle}>
                    Account Information
                </Text>

                <View style={styles.accountCard}>
                    <InfoRow
                        label="Worker ID"
                        value={
                            String(
                                worker._id ||
                                worker.id ||
                                workerId
                            )
                        }
                        last
                    />
                </View>

                {/* ================= FOOTER ================= */}

                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        SIH26041 • Site Officer • Worker Details
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}


/* =====================================================
   INFO ROW
===================================================== */

function InfoRow({
    label,
    value,
    last = false
}) {
    return (
        <View
            style={[
                styles.infoRow,
                !last && styles.infoRowBorder
            ]}
        >
            <Text style={styles.infoLabel}>
                {label}
            </Text>

            <Text
                style={styles.infoValue}
                numberOfLines={2}
            >
                {value}
            </Text>
        </View>
    );
}


/* =====================================================
   STAT CARD
===================================================== */

function StatCard({
    title,
    value,
    icon
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

    /* LOADING */

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

    /* ERROR */

    errorContainer: {
        flex: 1,
        backgroundColor: COLORS.background,
        justifyContent: "center",
        alignItems: "center",
        padding: SPACING.xl
    },

    errorIcon: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: "rgba(239, 68, 68, 0.10)",
        borderWidth: 1,
        borderColor: "rgba(239, 68, 68, 0.35)",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: SPACING.md
    },

    errorIconText: {
        color: COLORS.danger,
        fontSize: 28,
        fontWeight: "800"
    },

    errorTitle: {
        color: COLORS.white,
        fontSize: 20,
        fontWeight: "800"
    },

    errorText: {
        color: COLORS.textSecondary,
        fontSize: 13,
        textAlign: "center",
        lineHeight: 20,
        marginTop: SPACING.sm
    },

    backButton: {
        marginTop: SPACING.lg,
        backgroundColor: COLORS.primary,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: RADIUS.md,
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md
    },

    backButtonText: {
        color: COLORS.white,
        fontSize: 14,
        fontWeight: "700"
    },

    /* HEADER */

    header: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: SPACING.lg
    },

    headerBackButton: {
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

    headerBackText: {
        color: COLORS.white,
        fontSize: 32,
        lineHeight: 34,
        fontWeight: "300",
        marginTop: -3
    },

    headerTextContainer: {
        flex: 1
    },

    headerTitle: {
        color: COLORS.white,
        fontSize: 27,
        fontWeight: "800"
    },

    headerSubtitle: {
        color: COLORS.textSecondary,
        fontSize: 12,
        marginTop: 4
    },

    /* PROFILE */

    profileCard: {
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: RADIUS.lg,
        padding: SPACING.md
    },

    profileTop: {
        flexDirection: "row",
        alignItems: "center"
    },

    avatar: {
        width: 58,
        height: 58,
        borderRadius: 29,
        backgroundColor: "rgba(255, 215, 0, 0.14)",
        borderWidth: 1,
        borderColor: "rgba(255, 215, 0, 0.35)",
        justifyContent: "center",
        alignItems: "center",
        marginRight: SPACING.sm
    },

    avatarText: {
        color: COLORS.secondary,
        fontSize: 23,
        fontWeight: "800"
    },

    profileInfo: {
        flex: 1
    },

    workerName: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: "800"
    },

    workerRole: {
        color: COLORS.secondary,
        fontSize: 10,
        fontWeight: "800",
        letterSpacing: 1,
        marginTop: 4
    },

    statusBadge: {
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 20,
        paddingHorizontal: 8,
        paddingVertical: 5
    },

    activeBadge: {
        backgroundColor: "rgba(34, 197, 94, 0.10)"
    },

    inactiveBadge: {
        backgroundColor: "rgba(239, 68, 68, 0.10)"
    },

    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 5
    },

    activeDot: {
        backgroundColor: COLORS.success
    },

    inactiveDot: {
        backgroundColor: COLORS.danger
    },

    statusText: {
        fontSize: 9,
        fontWeight: "800"
    },

    activeText: {
        color: COLORS.success
    },

    inactiveText: {
        color: COLORS.danger
    },

    profileDivider: {
        height: 1,
        backgroundColor: COLORS.border,
        marginVertical: SPACING.md
    },

    infoRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: SPACING.sm
    },

    infoRowBorder: {
        borderBottomWidth: 1,
        borderBottomColor: "rgba(255,255,255,0.06)"
    },

    infoLabel: {
        color: COLORS.textSecondary,
        fontSize: 12,
        flex: 0.8
    },

    infoValue: {
        color: COLORS.white,
        fontSize: 12,
        fontWeight: "600",
        textAlign: "right",
        flex: 1.5
    },

    /* SECTION */

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
        width: 36,
        height: 36,
        borderRadius: RADIUS.md,
        backgroundColor: "rgba(255, 215, 0, 0.10)",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: SPACING.sm
    },

    statIconText: {
        fontSize: 17
    },

    statValue: {
        color: COLORS.white,
        fontSize: 25,
        fontWeight: "800"
    },

    statTitle: {
        color: COLORS.textSecondary,
        fontSize: 11,
        marginTop: 4
    },

    /* CERTIFICATION */

    certificateCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: RADIUS.lg,
        padding: SPACING.md
    },

    certificateIcon: {
        width: 48,
        height: 48,
        borderRadius: RADIUS.md,
        backgroundColor: "rgba(255, 215, 0, 0.10)",
        justifyContent: "center",
        alignItems: "center",
        marginRight: SPACING.md
    },

    certificateIconText: {
        fontSize: 22
    },

    certificateInfo: {
        flex: 1
    },

    certificateTitle: {
        color: COLORS.white,
        fontSize: 15,
        fontWeight: "800"
    },

    certificateSubtitle: {
        color: COLORS.textSecondary,
        fontSize: 11,
        marginTop: 4
    },

    certificateStats: {
        alignItems: "flex-end"
    },

    certificateVerified: {
        color: COLORS.success,
        fontSize: 23,
        fontWeight: "800"
    },

    certificateVerifiedLabel: {
        color: COLORS.textSecondary,
        fontSize: 9,
        marginTop: 2
    },

    /* ACCOUNT */

    accountCard: {
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: RADIUS.lg,
        paddingHorizontal: SPACING.md
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

