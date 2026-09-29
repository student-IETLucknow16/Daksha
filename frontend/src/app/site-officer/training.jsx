
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

import { getSiteOfficerTraining } from "../../services/siteOfficerService";
import { COLORS, SPACING, RADIUS } from "../../constants/theme";

export default function SiteOfficerTrainingScreen() {
    const router = useRouter();

    const [training, setTraining] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadTraining();
    }, []);

    const loadTraining = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getSiteOfficerTraining();

            console.log("SITE OFFICER TRAINING:", data);

            const trainingData =
                data?.training ||
                data?.trainingAttempts ||
                data?.attempts ||
                data?.data ||
                [];

            setTraining(
                Array.isArray(trainingData)
                    ? trainingData
                    : []
            );
        } catch (err) {
            console.error(
                "Failed to load site officer training:",
                err
            );

            setError(
                err?.response?.data?.message ||
                    "Unable to load training data."
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

    const getResultLabel = (item) => {
        if (item?.result) {
            return String(item.result)
                .replaceAll("_", " ")
                .toUpperCase();
        }

        if (item?.passed === true) return "PASSED";
        if (item?.passed === false) return "FAILED";

        return "IN PROGRESS";
    };

    const getResultColor = (item) => {
        if (
            item?.passed === true ||
            item?.result === "passed"
        ) {
            return COLORS.success;
        }

        if (
            item?.passed === false ||
            item?.result === "failed" ||
            item?.result === "failed_critical" ||
            item?.result === "failed_timeout"
        ) {
            return COLORS.danger;
        }

        return COLORS.warning;
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

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator
                    size="large"
                    color={COLORS.secondary}
                />

                <Text style={styles.loadingText}>
                    Loading training records...
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
                    Training Records
                </Text>

                <Text style={styles.subtitle}>
                    Monitor worker training attempts and
                    scenario performance.
                </Text>

                {error ? (
                    <View style={styles.errorCard}>
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

                {!error && training.length === 0 ? (
                    <View style={styles.emptyCard}>
                        <Text style={styles.emptyTitle}>
                            No Training Records
                        </Text>

                        <Text style={styles.emptyText}>
                            No training attempts are available
                            for your site yet.
                        </Text>
                    </View>
                ) : null}

                {training.map((item, index) => {
                    const resultColor =
                        getResultColor(item);

                    return (
                        <View
                            key={
                                item?._id ||
                                item?.id ||
                                index
                            }
                            style={styles.trainingCard}
                        >
                            <View style={styles.cardHeader}>
                                <View style={styles.workerSection}>
                                    <Text
                                        style={
                                            styles.workerName
                                        }
                                    >
                                        {getWorkerName(item)}
                                    </Text>

                                    <Text
                                        style={
                                            styles.workerEmail
                                        }
                                    >
                                        {getWorkerEmail(item)}
                                    </Text>
                                </View>

                                <View
                                    style={[
                                        styles.statusBadge,
                                        {
                                            borderColor:
                                                resultColor,
                                        },
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.statusText,
                                            {
                                                color:
                                                    resultColor,
                                            },
                                        ]}
                                    >
                                        {getResultLabel(item)}
                                    </Text>
                                </View>
                            </View>

                            <View
                                style={styles.divider}
                            />

                            <View style={styles.infoGrid}>
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
                                            item?.module?.moduleId ||
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
                                        Scenario Score
                                    </Text>

                                    <Text
                                        style={
                                            styles.scoreValue
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
                                        Started
                                    </Text>

                                    <Text
                                        style={
                                            styles.infoValue
                                        }
                                    >
                                        {formatDate(
                                            item?.startedAt
                                        )}
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
                                        Completed
                                    </Text>

                                    <Text
                                        style={
                                            styles.infoValue
                                        }
                                    >
                                        {formatDate(
                                            item?.completedAt
                                        )}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    );
                })}
            </ScrollView>
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

    trainingCard: {
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
        gap: SPACING.md,
    },

    workerSection: {
        flex: 1,
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
});
