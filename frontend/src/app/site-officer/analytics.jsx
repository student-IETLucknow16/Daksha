
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

import { getSiteOfficerAnalytics } from "../../services/siteOfficerService";
import { COLORS, SPACING, RADIUS } from "../../constants/theme";

export default function SiteOfficerAnalyticsScreen() {
    const router = useRouter();

    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadAnalytics();
    }, []);

    const loadAnalytics = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getSiteOfficerAnalytics();

            console.log("SITE OFFICER ANALYTICS:", data);

            setAnalytics(data);
        } catch (err) {
            console.error(
                "Failed to load site officer analytics:",
                err
            );

            setError(
                err?.response?.data?.message ||
                    "Unable to load analytics."
            );
        } finally {
            setLoading(false);
        }
    };

    const getValue = (...values) => {
        for (const value of values) {
            if (
                value !== undefined &&
                value !== null
            ) {
                return value;
            }
        }

        return 0;
    };

    const stats =
        analytics?.stats ||
        analytics?.statistics ||
        analytics?.data?.stats ||
        analytics?.data ||
        {};

    const workers = getValue(
        stats?.workers,
        stats?.totalWorkers,
        analytics?.totalWorkers
    );

    const trainingAttempts = getValue(
        stats?.trainingAttempts,
        stats?.totalTrainingAttempts,
        analytics?.totalTrainingAttempts
    );

    const assessments = getValue(
        stats?.assessments,
        stats?.totalAssessments,
        analytics?.totalAssessments
    );

    const certificates = getValue(
        stats?.certificates,
        stats?.totalCertificates,
        analytics?.totalCertificates
    );

    const trainingPassRate = getValue(
        stats?.trainingPassRate,
        stats?.trainingPassPercentage,
        analytics?.trainingPassRate
    );

    const assessmentPassRate = getValue(
        stats?.assessmentPassRate,
        stats?.assessmentPassPercentage,
        analytics?.assessmentPassRate
    );

    const certificationRate = getValue(
        stats?.certificationRate,
        stats?.certificateRate,
        analytics?.certificationRate
    );

    const verifiedCertificates = getValue(
        stats?.verifiedCertificates,
        stats?.blockchainVerified,
        analytics?.verifiedCertificates
    );

    const failedTraining = getValue(
        stats?.failedTraining,
        stats?.failedTrainingAttempts,
        analytics?.failedTraining
    );

    const failedAssessments = getValue(
        stats?.failedAssessments,
        analytics?.failedAssessments
    );

    const formatPercentage = (value) => {
        if (
            value === undefined ||
            value === null ||
            value === ""
        ) {
            return "0%";
        }

        return `${value}%`;
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator
                    size="large"
                    color={COLORS.secondary}
                />

                <Text style={styles.loadingText}>
                    Loading site analytics...
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
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
                    Site Analytics
                </Text>

                <Text style={styles.subtitle}>
                    Training, assessment, certification and
                    blockchain performance for your site.
                </Text>

                {error ? (
                    <View style={styles.errorCard}>
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

                <View style={styles.statsGrid}>
                    <StatCard
                        title="Workers"
                        value={workers}
                    />

                    <StatCard
                        title="Training Attempts"
                        value={trainingAttempts}
                    />

                    <StatCard
                        title="Assessments"
                        value={assessments}
                    />

                    <StatCard
                        title="Certificates"
                        value={certificates}
                    />
                </View>

                <Text style={styles.sectionTitle}>
                    Performance
                </Text>

                <View style={styles.performanceCard}>
                    <PerformanceRow
                        label="Training Pass Rate"
                        value={formatPercentage(
                            trainingPassRate
                        )}
                        positive={
                            Number(trainingPassRate) >= 70
                        }
                    />

                    <PerformanceRow
                        label="Assessment Pass Rate"
                        value={formatPercentage(
                            assessmentPassRate
                        )}
                        positive={
                            Number(assessmentPassRate) >= 70
                        }
                    />

                    <PerformanceRow
                        label="Certification Rate"
                        value={formatPercentage(
                            certificationRate
                        )}
                        positive={
                            Number(certificationRate) >= 70
                        }
                    />
                </View>

                <Text style={styles.sectionTitle}>
                    Training Overview
                </Text>

                <View style={styles.overviewCard}>
                    <OverviewRow
                        label="Total Training Attempts"
                        value={trainingAttempts}
                    />

                    <OverviewRow
                        label="Failed Training Attempts"
                        value={failedTraining}
                    />

                    <OverviewRow
                        label="Training Pass Rate"
                        value={formatPercentage(
                            trainingPassRate
                        )}
                    />
                </View>

                <Text style={styles.sectionTitle}>
                    Assessment Overview
                </Text>

                <View style={styles.overviewCard}>
                    <OverviewRow
                        label="Total Assessments"
                        value={assessments}
                    />

                    <OverviewRow
                        label="Failed Assessments"
                        value={failedAssessments}
                    />

                    <OverviewRow
                        label="Assessment Pass Rate"
                        value={formatPercentage(
                            assessmentPassRate
                        )}
                    />
                </View>

                <Text style={styles.sectionTitle}>
                    Blockchain
                </Text>

                <View style={styles.blockchainCard}>
                    <View
                        style={
                            styles.blockchainHeader
                        }
                    >
                        <Text
                            style={
                                styles.blockchainTitle
                            }
                        >
                            Certificate Verification
                        </Text>

                        <Text
                            style={
                                styles.blockchainIcon
                            }
                        >
                            ⛓
                        </Text>
                    </View>

                    <Text
                        style={
                            styles.blockchainDescription
                        }
                    >
                        Certificates verified through the
                        blockchain registry.
                    </Text>

                    <View
                        style={
                            styles.blockchainStats
                        }
                    >
                        <View
                            style={
                                styles.blockchainStat
                            }
                        >
                            <Text
                                style={
                                    styles.blockchainValue
                                }
                            >
                                {verifiedCertificates}
                            </Text>

                            <Text
                                style={
                                    styles.blockchainLabel
                                }
                            >
                                Verified
                            </Text>
                        </View>

                        <View
                            style={
                                styles.blockchainStat
                            }
                        >
                            <Text
                                style={
                                    styles.blockchainValue
                                }
                            >
                                {certificates}
                            </Text>

                            <Text
                                style={
                                    styles.blockchainLabel
                                }
                            >
                                Total
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

function StatCard({ title, value }) {
    return (
        <View style={styles.statCard}>
            <Text style={styles.statValue}>
                {value}
            </Text>

            <Text style={styles.statTitle}>
                {title}
            </Text>
        </View>
    );
}

function PerformanceRow({
    label,
    value,
    positive,
}) {
    return (
        <View style={styles.performanceRow}>
            <Text style={styles.performanceLabel}>
                {label}
            </Text>

            <Text
                style={[
                    styles.performanceValue,
                    {
                        color: positive
                            ? COLORS.success
                            : COLORS.warning,
                    },
                ]}
            >
                {value}
            </Text>
        </View>
    );
}

function OverviewRow({ label, value }) {
    return (
        <View style={styles.overviewRow}>
            <Text style={styles.overviewLabel}>
                {label}
            </Text>

            <Text style={styles.overviewValue}>
                {value}
            </Text>
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

    statsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        marginBottom: SPACING.lg,
    },

    statCard: {
        width: "48%",
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: RADIUS.lg,
        padding: SPACING.lg,
        marginBottom: SPACING.md,
    },

    statValue: {
        color: COLORS.secondary,
        fontSize: 27,
        fontWeight: "800",
        marginBottom: SPACING.xs,
    },

    statTitle: {
        color: COLORS.textSecondary,
        fontSize: 12,
        lineHeight: 17,
    },

    sectionTitle: {
        color: COLORS.text,
        fontSize: 19,
        fontWeight: "800",
        marginBottom: SPACING.md,
        marginTop: SPACING.sm,
    },

    performanceCard: {
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: RADIUS.lg,
        padding: SPACING.md,
        marginBottom: SPACING.lg,
    },

    performanceRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },

    performanceLabel: {
        color: COLORS.textSecondary,
        fontSize: 14,
    },

    performanceValue: {
        fontSize: 17,
        fontWeight: "800",
    },

    overviewCard: {
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: RADIUS.lg,
        paddingHorizontal: SPACING.md,
        marginBottom: SPACING.lg,
    },

    overviewRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },

    overviewLabel: {
        flex: 1,
        color: COLORS.textSecondary,
        fontSize: 13,
        marginRight: SPACING.md,
    },

    overviewValue: {
        color: COLORS.text,
        fontSize: 15,
        fontWeight: "700",
    },

    blockchainCard: {
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.secondary,
        borderRadius: RADIUS.lg,
        padding: SPACING.lg,
    },

    blockchainHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: SPACING.sm,
    },

    blockchainTitle: {
        color: COLORS.secondary,
        fontSize: 17,
        fontWeight: "800",
    },

    blockchainIcon: {
        fontSize: 24,
    },

    blockchainDescription: {
        color: COLORS.textSecondary,
        fontSize: 13,
        lineHeight: 19,
        marginBottom: SPACING.lg,
    },

    blockchainStats: {
        flexDirection: "row",
        justifyContent: "space-around",
    },

    blockchainStat: {
        alignItems: "center",
    },

    blockchainValue: {
        color: COLORS.text,
        fontSize: 25,
        fontWeight: "800",
    },

    blockchainLabel: {
        color: COLORS.textSecondary,
        fontSize: 12,
        marginTop: 4,
    },
});


