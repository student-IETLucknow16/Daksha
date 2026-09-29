
import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator
} from "react-native";
import { useRouter } from "expo-router";

import { useAuth } from "../../context/AuthContext";
import { getAdminDashboard } from "../../services/adminService";
import { COLORS, SPACING, RADIUS } from "../../constants/theme";

export default function AdminDashboard() {
    const router = useRouter();
    const { user, logout } = useAuth();

    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadDashboard = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getAdminDashboard();

            console.log("ADMIN DASHBOARD:", data);

            setDashboard(data);
        } catch (err) {
            console.error("Failed to load admin dashboard:", err);

            setError(
                err?.response?.data?.message ||
                "Unable to load admin dashboard."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDashboard();
    }, []);

    const handleLogout = async () => {
        try {
            await logout();
        } catch (err) {
            console.error("Logout error:", err);
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator
                    size="large"
                    color={COLORS.secondary}
                />

                <Text style={styles.loadingText}>
                    Loading admin dashboard...
                </Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.center}>
                <Text style={styles.errorIcon}>⚠️</Text>

                <Text style={styles.errorTitle}>
                    Dashboard unavailable
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
        );
    }

    const statistics =
        dashboard?.statistics ||
        dashboard?.stats ||
        {};

    const totalWorkers =
        statistics.totalWorkers ??
        statistics.workers ??
        0;

    const activeWorkers =
        statistics.activeWorkers ??
        statistics.activeWorkersCount ??
        0;

    const totalTrainingAttempts =
        statistics.totalTrainingAttempts ??
        statistics.trainingAttempts ??
        0;

    const completedTraining =
        statistics.completedTraining ??
        statistics.completedTrainings ??
        0;

    const totalAssessments =
        statistics.totalAssessments ??
        statistics.assessments ??
        0;

    const passedAssessments =
        statistics.passedAssessments ??
        statistics.passedAssessmentsCount ??
        0;

    const totalCertificates =
        statistics.totalCertificates ??
        statistics.certificates ??
        0;

    const verifiedCertificates =
        statistics.verifiedCertificates ??
        statistics.verifiedCertificatesCount ??
        0;

    return (
        <View style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.eyebrow}>
                            ADMIN CONSOLE
                        </Text>

                        <Text style={styles.title}>
                            System Dashboard
                        </Text>

                        <Text style={styles.subtitle}>
                            Welcome, {user?.name || "Administrator"}
                        </Text>
                    </View>

                    <View style={styles.adminBadge}>
                        <Text style={styles.adminBadgeText}>
                            ADMIN
                        </Text>
                    </View>
                </View>

                {/* System Overview */}
                <Text style={styles.sectionTitle}>
                    System Overview
                </Text>

                <View style={styles.statsGrid}>
                    <View style={styles.statCard}>
                        <Text style={styles.statIcon}>
                            👷
                        </Text>

                        <Text style={styles.statValue}>
                            {totalWorkers}
                        </Text>

                        <Text style={styles.statLabel}>
                            Total Workers
                        </Text>
                    </View>

                    <View style={styles.statCard}>
                        <Text style={styles.statIcon}>
                            🟢
                        </Text>

                        <Text style={styles.statValue}>
                            {activeWorkers}
                        </Text>

                        <Text style={styles.statLabel}>
                            Active Workers
                        </Text>
                    </View>

                    <View style={styles.statCard}>
                        <Text style={styles.statIcon}>
                            🎯
                        </Text>

                        <Text style={styles.statValue}>
                            {totalTrainingAttempts}
                        </Text>

                        <Text style={styles.statLabel}>
                            Training Attempts
                        </Text>
                    </View>

                    <View style={styles.statCard}>
                        <Text style={styles.statIcon}>
                            🏆
                        </Text>

                        <Text style={styles.statValue}>
                            {totalCertificates}
                        </Text>

                        <Text style={styles.statLabel}>
                            Certificates
                        </Text>
                    </View>
                </View>

                {/* Training */}
                <Text style={styles.sectionTitle}>
                    Training
                </Text>

                <View style={styles.infoCard}>
                    <View style={styles.infoRow}>
                        <View>
                            <Text style={styles.infoLabel}>
                                Training Attempts
                            </Text>

                            <Text style={styles.infoDescription}>
                                Total worker training attempts
                            </Text>
                        </View>

                        <Text style={styles.infoValue}>
                            {totalTrainingAttempts}
                        </Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.infoRow}>
                        <View>
                            <Text style={styles.infoLabel}>
                                Completed Training
                            </Text>

                            <Text style={styles.infoDescription}>
                                Completed training attempts
                            </Text>
                        </View>

                        <Text style={styles.infoValue}>
                            {completedTraining}
                        </Text>
                    </View>
                </View>

                {/* Assessments */}
                <Text style={styles.sectionTitle}>
                    Assessments
                </Text>

                <View style={styles.infoCard}>
                    <View style={styles.infoRow}>
                        <View>
                            <Text style={styles.infoLabel}>
                                Total Assessments
                            </Text>

                            <Text style={styles.infoDescription}>
                                Worker assessment submissions
                            </Text>
                        </View>

                        <Text style={styles.infoValue}>
                            {totalAssessments}
                        </Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.infoRow}>
                        <View>
                            <Text style={styles.infoLabel}>
                                Passed Assessments
                            </Text>

                            <Text style={styles.infoDescription}>
                                Successfully passed assessments
                            </Text>
                        </View>

                        <Text style={styles.infoValue}>
                            {passedAssessments}
                        </Text>
                    </View>
                </View>

                {/* Certifications */}
                <Text style={styles.sectionTitle}>
                    Certification Overview
                </Text>

                <View style={styles.certificationCard}>
                    <View style={styles.certificationMain}>
                        <Text style={styles.certificationIcon}>
                            🏆
                        </Text>

                        <View>
                            <Text style={styles.certificationTitle}>
                                Blockchain Certificates
                            </Text>

                            <Text style={styles.certificationSubtitle}>
                                {verifiedCertificates} verified
                            </Text>
                        </View>
                    </View>

                    <View style={styles.certificationStats}>
                        <View style={styles.certStat}>
                            <Text style={styles.certStatValue}>
                                {totalCertificates}
                            </Text>

                            <Text style={styles.certStatLabel}>
                                Issued
                            </Text>
                        </View>

                        <View style={styles.certStatDivider} />

                        <View style={styles.certStat}>
                            <Text style={styles.certStatValue}>
                                {verifiedCertificates}
                            </Text>

                            <Text style={styles.certStatLabel}>
                                Verified
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Administration */}
                <Text style={styles.sectionTitle}>
                    Administration
                </Text>

                <TouchableOpacity
                    style={styles.actionCard}
                    onPress={() => router.push("/admin/workers")}
                    activeOpacity={0.8}
                >
                    <View style={styles.actionIcon}>
                        <Text style={styles.actionIconText}>
                            👷
                        </Text>
                    </View>

                    <View style={styles.actionContent}>
                        <Text style={styles.actionTitle}>
                            Manage Workers
                        </Text>

                        <Text style={styles.actionSubtitle}>
                            View and manage registered workers
                        </Text>
                    </View>

                    <Text style={styles.actionArrow}>
                        ›
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.actionCard}
                    onPress={() => router.push("/admin/training")}
                    activeOpacity={0.8}
                >
                    <View style={styles.actionIcon}>
                        <Text style={styles.actionIconText}>
                            📚
                        </Text>
                    </View>

                    <View style={styles.actionContent}>
                        <Text style={styles.actionTitle}>
                            Training Management
                        </Text>

                        <Text style={styles.actionSubtitle}>
                            View training activity and modules
                        </Text>
                    </View>

                    <Text style={styles.actionArrow}>
                        ›
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.actionCard}
                    onPress={() => router.push("/admin/assessments")}
                    activeOpacity={0.8}
                >
                    <View style={styles.actionIcon}>
                        <Text style={styles.actionIconText}>
                            📝
                        </Text>
                    </View>

                    <View style={styles.actionContent}>
                        <Text style={styles.actionTitle}>
                            Assessments
                        </Text>

                        <Text style={styles.actionSubtitle}>
                            Review worker assessment activity
                        </Text>
                    </View>

                    <Text style={styles.actionArrow}>
                        ›
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.actionCard}
                    onPress={() => router.push("/admin/certifications")}
                    activeOpacity={0.8}
                >
                    <View style={styles.actionIcon}>
                        <Text style={styles.actionIconText}>
                            🏆
                        </Text>
                    </View>

                    <View style={styles.actionContent}>
                        <Text style={styles.actionTitle}>
                            Certifications
                        </Text>

                        <Text style={styles.actionSubtitle}>
                            View issued and verified certificates
                        </Text>
                    </View>

                    <Text style={styles.actionArrow}>
                        ›
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.actionCard}
                    onPress={() => router.push("/admin/analytics")}
                    activeOpacity={0.8}
                >
                    <View style={styles.actionIcon}>
                        <Text style={styles.actionIconText}>
                            📊
                        </Text>
                    </View>

                    <View style={styles.actionContent}>
                        <Text style={styles.actionTitle}>
                            Analytics
                        </Text>

                        <Text style={styles.actionSubtitle}>
                            View system performance and statistics
                        </Text>
                    </View>

                    <Text style={styles.actionArrow}>
                        ›
                    </Text>
                </TouchableOpacity>

                {/* Logout */}
                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={handleLogout}
                    activeOpacity={0.8}
                >
                    <Text style={styles.logoutText}>
                        Logout
                    </Text>
                </TouchableOpacity>

                <Text style={styles.footer}>
                    SIH 26041 • Safety Training & Certification
                </Text>
            </ScrollView>
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

    center: {
        flex: 1,
        backgroundColor: COLORS.background,
        justifyContent: "center",
        alignItems: "center",
        padding: SPACING.xl
    },

    loadingText: {
        color: COLORS.textSecondary,
        fontSize: 14,
        marginTop: SPACING.md
    },

    errorIcon: {
        fontSize: 42,
        marginBottom: SPACING.md
    },

    errorTitle: {
        color: COLORS.white,
        fontSize: 22,
        fontWeight: "800",
        textAlign: "center"
    },

    errorText: {
        color: COLORS.textSecondary,
        fontSize: 14,
        textAlign: "center",
        marginTop: SPACING.sm,
        lineHeight: 21
    },

    retryButton: {
        backgroundColor: COLORS.secondary,
        borderRadius: RADIUS.md,
        paddingHorizontal: SPACING.xl,
        paddingVertical: SPACING.md,
        marginTop: SPACING.lg
    },

    retryText: {
        color: "#041029",
        fontSize: 14,
        fontWeight: "800"
    },

    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: SPACING.xl
    },

    eyebrow: {
        color: COLORS.secondary,
        fontSize: 11,
        fontWeight: "800",
        letterSpacing: 1.5,
        marginBottom: 5
    },

    title: {
        color: COLORS.white,
        fontSize: 28,
        fontWeight: "800"
    },

    subtitle: {
        color: COLORS.textSecondary,
        fontSize: 14,
        marginTop: 5
    },

    adminBadge: {
        backgroundColor: "rgba(255,215,0,0.12)",
        borderWidth: 1,
        borderColor: COLORS.secondary,
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 7
    },

    adminBadgeText: {
        color: COLORS.secondary,
        fontSize: 10,
        fontWeight: "800",
        letterSpacing: 1
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
        width: "48%",
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
        padding: SPACING.lg,
        marginBottom: SPACING.md
    },

    statIcon: {
        fontSize: 24,
        marginBottom: SPACING.sm
    },

    statValue: {
        color: COLORS.secondary,
        fontSize: 28,
        fontWeight: "800"
    },

    statLabel: {
        color: COLORS.textSecondary,
        fontSize: 12,
        marginTop: 4
    },

    infoCard: {
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
        padding: SPACING.lg,
        marginBottom: SPACING.lg
    },

    infoRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between"
    },

    infoLabel: {
        color: COLORS.white,
        fontSize: 15,
        fontWeight: "700"
    },

    infoDescription: {
        color: COLORS.textSecondary,
        fontSize: 12,
        marginTop: 4
    },

    infoValue: {
        color: COLORS.secondary,
        fontSize: 22,
        fontWeight: "800"
    },

    divider: {
        height: 1,
        backgroundColor: COLORS.border,
        marginVertical: SPACING.md
    },

    certificationCard: {
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
        padding: SPACING.lg,
        marginBottom: SPACING.lg
    },

    certificationMain: {
        flexDirection: "row",
        alignItems: "center"
    },

    certificationIcon: {
        fontSize: 32,
        marginRight: SPACING.md
    },

    certificationTitle: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: "800"
    },

    certificationSubtitle: {
        color: COLORS.success,
        fontSize: 12,
        marginTop: 4
    },

    certificationStats: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: SPACING.lg,
        paddingTop: SPACING.md,
        borderTopWidth: 1,
        borderTopColor: COLORS.border
    },

    certStat: {
        flex: 1,
        alignItems: "center"
    },

    certStatValue: {
        color: COLORS.secondary,
        fontSize: 24,
        fontWeight: "800"
    },

    certStatLabel: {
        color: COLORS.textSecondary,
        fontSize: 11,
        marginTop: 3
    },

    certStatDivider: {
        width: 1,
        height: 35,
        backgroundColor: COLORS.border
    },

    actionCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
        padding: SPACING.md,
        marginBottom: SPACING.md
    },

    actionIcon: {
        width: 46,
        height: 46,
        borderRadius: 14,
        backgroundColor: COLORS.primary,
        justifyContent: "center",
        alignItems: "center",
        marginRight: SPACING.md
    },

    actionIconText: {
        fontSize: 22
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
        marginTop: 4
    },

    actionArrow: {
        color: COLORS.secondary,
        fontSize: 30,
        marginLeft: SPACING.sm
    },

    logoutButton: {
        borderWidth: 1,
        borderColor: COLORS.danger,
        borderRadius: RADIUS.md,
        paddingVertical: SPACING.md,
        alignItems: "center",
        marginTop: SPACING.lg
    },

    logoutText: {
        color: COLORS.danger,
        fontSize: 14,
        fontWeight: "800"
    },

    footer: {
        color: COLORS.textSecondary,
        fontSize: 11,
        textAlign: "center",
        marginTop: SPACING.lg,
        opacity: 0.7
    }
});

