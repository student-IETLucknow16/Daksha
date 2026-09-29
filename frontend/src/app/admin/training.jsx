
import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl
} from "react-native";
import { useRouter } from "expo-router";

import { getAdminTraining } from "../../services/adminService";
import { COLORS, SPACING, RADIUS } from "../../constants/theme";

export default function AdminTraining() {
    const router = useRouter();

    const [training, setTraining] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    const loadTraining = async () => {
        try {
            setError("");

            const data = await getAdminTraining();

            console.log("ADMIN TRAINING:", data);

            /*
             * The backend may return the list using different
             * property names. Handle the common formats here.
             */
            const trainingList =
                data?.training ||
                data?.modules ||
                data?.attempts ||
                data?.data ||
                [];

            setTraining(
                Array.isArray(trainingList)
                    ? trainingList
                    : []
            );
        } catch (err) {
            console.error(
                "Failed to load admin training:",
                err
            );

            setError(
                err?.response?.data?.message ||
                "Unable to load training data."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadTraining();
    }, []);

    const handleRefresh = () => {
        setRefreshing(true);
        loadTraining();
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator
                    size="large"
                    color={COLORS.secondary}
                />

                <Text style={styles.loadingText}>
                    Loading training data...
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
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <Text style={styles.backText}>
                            ‹
                        </Text>
                    </TouchableOpacity>

                    <View>
                        <Text style={styles.title}>
                            Training
                        </Text>

                        <Text style={styles.subtitle}>
                            Training activity and modules
                        </Text>
                    </View>
                </View>

                {/* Error */}
                {error ? (
                    <View style={styles.errorCard}>
                        <Text style={styles.errorIcon}>
                            ⚠️
                        </Text>

                        <Text style={styles.errorTitle}>
                            Unable to load training
                        </Text>

                        <Text style={styles.errorText}>
                            {error}
                        </Text>

                        <TouchableOpacity
                            style={styles.retryButton}
                            onPress={loadTraining}
                        >
                            <Text style={styles.retryText}>
                                Retry
                            </Text>
                        </TouchableOpacity>
                    </View>
                ) : null}

                {/* Summary */}
                {!error && (
                    <View style={styles.summaryCard}>
                        <View>
                            <Text style={styles.summaryLabel}>
                                Training Records
                            </Text>

                            <Text style={styles.summaryDescription}>
                                Data returned by the admin training API
                            </Text>
                        </View>

                        <Text style={styles.summaryValue}>
                            {training.length}
                        </Text>
                    </View>
                )}

                {/* Empty */}
                {!error && training.length === 0 && (
                    <View style={styles.emptyCard}>
                        <Text style={styles.emptyIcon}>
                            📚
                        </Text>

                        <Text style={styles.emptyTitle}>
                            No training records
                        </Text>

                        <Text style={styles.emptyText}>
                            Training data will appear here when
                            records are available.
                        </Text>
                    </View>
                )}

                {/* Training records */}
                {!error &&
                    training.map((item, index) => {
                        const moduleId =
                            item.moduleId ||
                            item.module?.moduleId ||
                            "Unknown module";

                        const title =
                            item.title ||
                            item.module?.title ||
                            moduleId;

                        const description =
                            item.description ||
                            item.module?.description ||
                            "Training module";

                        const attempts =
                            item.attempts ??
                            item.totalAttempts ??
                            item.trainingAttempts ??
                            null;

                        const completed =
                            item.completed ??
                            item.completedAttempts ??
                            item.completedTraining ??
                            null;

                        const passed =
                            item.passed ??
                            item.passedAttempts ??
                            null;

                        return (
                            <View
                                key={
                                    item._id ||
                                    item.id ||
                                    moduleId ||
                                    index
                                }
                                style={styles.trainingCard}
                            >
                                {/* Card header */}
                                <View style={styles.trainingHeader}>
                                    <View style={styles.moduleIcon}>
                                        <Text style={styles.moduleIconText}>
                                            📚
                                        </Text>
                                    </View>

                                    <View style={styles.trainingInfo}>
                                        <Text
                                            style={styles.trainingTitle}
                                            numberOfLines={2}
                                        >
                                            {title}
                                        </Text>

                                        <Text
                                            style={styles.moduleId}
                                            numberOfLines={1}
                                        >
                                            {moduleId}
                                        </Text>
                                    </View>
                                </View>

                                <Text
                                    style={styles.trainingDescription}
                                    numberOfLines={3}
                                >
                                    {description}
                                </Text>

                                {/* Statistics */}
                                {(attempts !== null ||
                                    completed !== null ||
                                    passed !== null) && (
                                    <>
                                        <View
                                            style={styles.divider}
                                        />

                                        <View
                                            style={styles.metricsRow}
                                        >
                                            {attempts !== null && (
                                                <View
                                                    style={styles.metric}
                                                >
                                                    <Text
                                                        style={
                                                            styles.metricValue
                                                        }
                                                    >
                                                        {attempts}
                                                    </Text>

                                                    <Text
                                                        style={
                                                            styles.metricLabel
                                                        }
                                                    >
                                                        Attempts
                                                    </Text>
                                                </View>
                                            )}

                                            {completed !== null && (
                                                <View
                                                    style={styles.metric}
                                                >
                                                    <Text
                                                        style={
                                                            styles.metricValue
                                                        }
                                                    >
                                                        {completed}
                                                    </Text>

                                                    <Text
                                                        style={
                                                            styles.metricLabel
                                                        }
                                                    >
                                                        Completed
                                                    </Text>
                                                </View>
                                            )}

                                            {passed !== null && (
                                                <View
                                                    style={styles.metric}
                                                >
                                                    <Text
                                                        style={
                                                            styles.metricValue
                                                        }
                                                    >
                                                        {passed}
                                                    </Text>

                                                    <Text
                                                        style={
                                                            styles.metricLabel
                                                        }
                                                    >
                                                        Passed
                                                    </Text>
                                                </View>
                                            )}
                                        </View>
                                    </>
                                )}

                                {/* Additional information */}
                                {(item.version ||
                                    item.passingScore !== undefined) && (
                                    <View style={styles.metaRow}>
                                        {item.version && (
                                            <View
                                                style={styles.metaBadge}
                                            >
                                                <Text
                                                    style={
                                                        styles.metaText
                                                    }
                                                >
                                                    Version{" "}
                                                    {item.version}
                                                </Text>
                                            </View>
                                        )}

                                        {item.passingScore !==
                                            undefined && (
                                            <View
                                                style={styles.metaBadge}
                                            >
                                                <Text
                                                    style={
                                                        styles.metaText
                                                    }
                                                >
                                                    Pass:{" "}
                                                    {item.passingScore}%
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                )}
                            </View>
                        );
                    })}

                {/* Debug note */}
                {!error && training.length === 0 && (
                    <Text style={styles.debugText}>
                        Check the Expo console for:
                        {"\n"}
                        ADMIN TRAINING:
                    </Text>
                )}
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
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: COLORS.background
    },

    loadingText: {
        color: COLORS.textSecondary,
        fontSize: 14,
        marginTop: SPACING.md
    },

    header: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: SPACING.lg
    },

    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: COLORS.surface,
        justifyContent: "center",
        alignItems: "center",
        marginRight: SPACING.md
    },

    backText: {
        color: COLORS.white,
        fontSize: 34,
        lineHeight: 38
    },

    title: {
        color: COLORS.white,
        fontSize: 28,
        fontWeight: "800"
    },

    subtitle: {
        color: COLORS.textSecondary,
        fontSize: 14,
        marginTop: 3
    },

    summaryCard: {
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
        padding: SPACING.lg,
        marginBottom: SPACING.lg,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between"
    },

    summaryLabel: {
        color: COLORS.white,
        fontSize: 15,
        fontWeight: "700"
    },

    summaryDescription: {
        color: COLORS.textSecondary,
        fontSize: 11,
        marginTop: 4
    },

    summaryValue: {
        color: COLORS.secondary,
        fontSize: 32,
        fontWeight: "800"
    },

    trainingCard: {
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
        padding: SPACING.lg,
        marginBottom: SPACING.md
    },

    trainingHeader: {
        flexDirection: "row",
        alignItems: "center"
    },

    moduleIcon: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: COLORS.primary,
        justifyContent: "center",
        alignItems: "center",
        marginRight: SPACING.md
    },

    moduleIconText: {
        fontSize: 23
    },

    trainingInfo: {
        flex: 1
    },

    trainingTitle: {
        color: COLORS.white,
        fontSize: 17,
        fontWeight: "800"
    },

    moduleId: {
        color: COLORS.secondary,
        fontSize: 11,
        marginTop: 4
    },

    trainingDescription: {
        color: COLORS.textSecondary,
        fontSize: 13,
        lineHeight: 19,
        marginTop: SPACING.md
    },

    divider: {
        height: 1,
        backgroundColor: COLORS.border,
        marginVertical: SPACING.md
    },

    metricsRow: {
        flexDirection: "row",
        justifyContent: "space-around"
    },

    metric: {
        flex: 1,
        alignItems: "center"
    },

    metricValue: {
        color: COLORS.secondary,
        fontSize: 21,
        fontWeight: "800"
    },

    metricLabel: {
        color: COLORS.textSecondary,
        fontSize: 10,
        marginTop: 3
    },

    metaRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginTop: SPACING.md
    },

    metaBadge: {
        backgroundColor: "rgba(255,215,0,0.10)",
        borderWidth: 1,
        borderColor: "rgba(255,215,0,0.30)",
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 5,
        marginRight: SPACING.sm,
        marginBottom: SPACING.sm
    },

    metaText: {
        color: COLORS.secondary,
        fontSize: 10,
        fontWeight: "700"
    },

    emptyCard: {
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
        padding: SPACING.xl,
        alignItems: "center"
    },

    emptyIcon: {
        fontSize: 42,
        marginBottom: SPACING.md
    },

    emptyTitle: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: "800"
    },

    emptyText: {
        color: COLORS.textSecondary,
        fontSize: 13,
        textAlign: "center",
        lineHeight: 19,
        marginTop: SPACING.sm
    },

    errorCard: {
        backgroundColor: "rgba(239,68,68,0.12)",
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        borderColor: COLORS.danger,
        padding: SPACING.lg,
        alignItems: "center"
    },

    errorIcon: {
        fontSize: 30,
        marginBottom: SPACING.sm
    },

    errorTitle: {
        color: COLORS.white,
        fontSize: 17,
        fontWeight: "800"
    },

    errorText: {
        color: COLORS.textSecondary,
        fontSize: 13,
        textAlign: "center",
        marginTop: SPACING.sm
    },

    retryButton: {
        backgroundColor: COLORS.danger,
        borderRadius: RADIUS.md,
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.sm,
        marginTop: SPACING.md
    },

    retryText: {
        color: COLORS.white,
        fontWeight: "800"
    },

    debugText: {
        color: COLORS.textSecondary,
        fontSize: 11,
        textAlign: "center",
        marginTop: SPACING.lg,
        opacity: 0.7
    }
});

