
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

import { getAdminWorkers } from "../../services/adminService";
import { COLORS, SPACING, RADIUS } from "../../constants/theme";

export default function AdminWorkers() {
    const router = useRouter();

    const [workers, setWorkers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    const loadWorkers = async () => {
        try {
            setError("");

            const data = await getAdminWorkers();

            console.log("ADMIN WORKERS:", data);

            setWorkers(data?.workers || []);
        } catch (err) {
            console.error("Failed to load admin workers:", err);

            setError(
                err?.response?.data?.message ||
                "Unable to load workers."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadWorkers();
    }, []);

    const handleRefresh = () => {
        setRefreshing(true);
        loadWorkers();
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator
                    size="large"
                    color={COLORS.secondary}
                />

                <Text style={styles.loadingText}>
                    Loading workers...
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
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <Text style={styles.backText}>‹</Text>
                    </TouchableOpacity>

                    <View>
                        <Text style={styles.title}>
                            Workers
                        </Text>

                        <Text style={styles.subtitle}>
                            Manage registered workers
                        </Text>
                    </View>
                </View>

                {/* Error */}
                {error ? (
                    <View style={styles.errorCard}>
                        <Text style={styles.errorTitle}>
                            Unable to load workers
                        </Text>

                        <Text style={styles.errorText}>
                            {error}
                        </Text>

                        <TouchableOpacity
                            style={styles.retryButton}
                            onPress={loadWorkers}
                        >
                            <Text style={styles.retryText}>
                                Retry
                            </Text>
                        </TouchableOpacity>
                    </View>
                ) : null}

                {/* Worker count */}
                {!error && (
                    <View style={styles.summaryCard}>
                        <Text style={styles.summaryLabel}>
                            Registered Workers
                        </Text>

                        <Text style={styles.summaryValue}>
                            {workers.length}
                        </Text>
                    </View>
                )}

                {/* Worker list */}
                {!error && workers.length === 0 ? (
                    <View style={styles.emptyCard}>
                        <Text style={styles.emptyIcon}>
                            👷
                        </Text>

                        <Text style={styles.emptyTitle}>
                            No workers found
                        </Text>

                        <Text style={styles.emptyText}>
                            Registered workers will appear here.
                        </Text>
                    </View>
                ) : null}

                {!error &&
                    workers.map((worker, index) => (
                        <View
                            key={worker._id || worker.id || index}
                            style={styles.workerCard}
                        >
                            <View style={styles.workerTop}>
                                <View style={styles.avatar}>
                                    <Text style={styles.avatarText}>
                                        {(worker.name || "W")
                                            .charAt(0)
                                            .toUpperCase()}
                                    </Text>
                                </View>

                                <View style={styles.workerInfo}>
                                    <Text style={styles.workerName}>
                                        {worker.name || "Unknown Worker"}
                                    </Text>

                                    <Text style={styles.workerEmail}>
                                        {worker.email || "No email"}
                                    </Text>
                                </View>

                                <View
                                    style={[
                                        styles.statusBadge,
                                        worker.isActive
                                            ? styles.activeBadge
                                            : styles.inactiveBadge
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.statusText,
                                            worker.isActive
                                                ? styles.activeText
                                                : styles.inactiveText
                                        ]}
                                    >
                                        {worker.isActive
                                            ? "Active"
                                            : "Inactive"}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.divider} />

                            <View style={styles.detailsRow}>
                                <View style={styles.detail}>
                                    <Text style={styles.detailLabel}>
                                        Phone
                                    </Text>

                                    <Text style={styles.detailValue}>
                                        {worker.phone || "Not provided"}
                                    </Text>
                                </View>

                                <View style={styles.detail}>
                                    <Text style={styles.detailLabel}>
                                        Site
                                    </Text>

                                    <Text style={styles.detailValue}>
                                        {worker.site || "Not assigned"}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.detailsRow}>
                                <View style={styles.detail}>
                                    <Text style={styles.detailLabel}>
                                        Language
                                    </Text>

                                    <Text style={styles.detailValue}>
                                        {worker.preferredLanguage || "en"}
                                    </Text>
                                </View>

                                <View style={styles.detail}>
                                    <Text style={styles.detailLabel}>
                                        Role
                                    </Text>

                                    <Text style={styles.detailValue}>
                                        {worker.role || "worker"}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    ))}
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
        marginTop: SPACING.md,
        fontSize: 15
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
        marginBottom: SPACING.lg
    },

    summaryLabel: {
        color: COLORS.textSecondary,
        fontSize: 14
    },

    summaryValue: {
        color: COLORS.secondary,
        fontSize: 34,
        fontWeight: "800",
        marginTop: 4
    },

    workerCard: {
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
        padding: SPACING.lg,
        marginBottom: SPACING.md
    },

    workerTop: {
        flexDirection: "row",
        alignItems: "center"
    },

    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: COLORS.primary,
        justifyContent: "center",
        alignItems: "center",
        marginRight: SPACING.md
    },

    avatarText: {
        color: COLORS.secondary,
        fontSize: 20,
        fontWeight: "800"
    },

    workerInfo: {
        flex: 1
    },

    workerName: {
        color: COLORS.white,
        fontSize: 17,
        fontWeight: "700"
    },

    workerEmail: {
        color: COLORS.textSecondary,
        fontSize: 12,
        marginTop: 3
    },

    statusBadge: {
        paddingHorizontal: 9,
        paddingVertical: 5,
        borderRadius: 20
    },

    activeBadge: {
        backgroundColor: "rgba(34,197,94,0.15)"
    },

    inactiveBadge: {
        backgroundColor: "rgba(239,68,68,0.15)"
    },

    statusText: {
        fontSize: 11,
        fontWeight: "700"
    },

    activeText: {
        color: COLORS.success
    },

    inactiveText: {
        color: COLORS.danger
    },

    divider: {
        height: 1,
        backgroundColor: COLORS.border,
        marginVertical: SPACING.md
    },

    detailsRow: {
        flexDirection: "row",
        marginBottom: SPACING.sm
    },

    detail: {
        flex: 1
    },

    detailLabel: {
        color: COLORS.textSecondary,
        fontSize: 11,
        marginBottom: 3
    },

    detailValue: {
        color: COLORS.white,
        fontSize: 13,
        fontWeight: "600"
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
        fontWeight: "700"
    },

    emptyText: {
        color: COLORS.textSecondary,
        fontSize: 13,
        textAlign: "center",
        marginTop: SPACING.sm
    },

    errorCard: {
        backgroundColor: "rgba(239,68,68,0.12)",
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        borderColor: COLORS.danger,
        padding: SPACING.lg,
        marginBottom: SPACING.lg
    },

    errorTitle: {
        color: COLORS.white,
        fontSize: 17,
        fontWeight: "700"
    },

    errorText: {
        color: COLORS.textSecondary,
        fontSize: 13,
        marginTop: SPACING.sm
    },

    retryButton: {
        backgroundColor: COLORS.danger,
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.lg,
        borderRadius: RADIUS.md,
        alignSelf: "flex-start",
        marginTop: SPACING.md
    },

    retryText: {
        color: COLORS.white,
        fontWeight: "700"
    }
});


