import React, { useCallback, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
    ActivityIndicator,
    RefreshControl
} from "react-native";
import { useRouter } from "expo-router";

import { COLORS, SPACING, RADIUS } from "../../../constants/theme";
import { getTrainingModules } from "../../../services/trainingService";

export default function TrainingModulesScreen() {
    const router = useRouter();

    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    const loadModules = useCallback(async () => {
        try {
            setError("");

            const data = await getTrainingModules();

            setModules(data?.modules || []);
        } catch (err) {
            console.error("Failed to load training modules:", err);

            setError(
                err?.response?.data?.message ||
                "Unable to load training modules."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    React.useEffect(() => {
        loadModules();
    }, [loadModules]);

    const handleRefresh = () => {
        setRefreshing(true);
        loadModules();
    };

    const handleModulePress = (moduleId) => {
        router.push(`/worker/training/${moduleId}`);
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator
                    size="large"
                    color={COLORS.secondary}
                />

                <Text style={styles.loadingText}>
                    Loading training modules...
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
                    <Pressable
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <Text style={styles.backText}>←</Text>
                    </Pressable>

                    <View style={styles.headerTextContainer}>
                        <Text style={styles.title}>
                            Training Modules
                        </Text>

                        <Text style={styles.subtitle}>
                            Complete AR safety training modules
                        </Text>
                    </View>
                </View>

                {/* Error */}
                {error ? (
                    <View style={styles.errorCard}>
                        <Text style={styles.errorTitle}>
                            Unable to load modules
                        </Text>

                        <Text style={styles.errorText}>
                            {error}
                        </Text>

                        <Pressable
                            style={styles.retryButton}
                            onPress={loadModules}
                        >
                            <Text style={styles.retryText}>
                                Try Again
                            </Text>
                        </Pressable>
                    </View>
                ) : null}

                {/* Module count */}
                {!error && (
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>
                            Available Training
                        </Text>

                        <Text style={styles.moduleCount}>
                            {modules.length} module
                            {modules.length !== 1 ? "s" : ""}
                        </Text>
                    </View>
                )}

                {/* Modules */}
                {!error && modules.length > 0 ? (
                    modules.map((module) => (
                        <Pressable
                            key={module.moduleId}
                            style={({ pressed }) => [
                                styles.moduleCard,
                                pressed && styles.moduleCardPressed
                            ]}
                            onPress={() =>
                                handleModulePress(module.moduleId)
                            }
                        >
                            <View style={styles.moduleIcon}>
                                <Text style={styles.moduleIconText}>
                                    🛡️
                                </Text>
                            </View>

                            <View style={styles.moduleContent}>
                                <View style={styles.moduleTopRow}>
                                    <Text style={styles.moduleTitle}>
                                        {module.title}
                                    </Text>

                                    <Text style={styles.arrow}>
                                        →
                                    </Text>
                                </View>

                                <Text
                                    style={styles.moduleDescription}
                                    numberOfLines={3}
                                >
                                    {module.description ||
                                        "Complete this safety training module."}
                                </Text>

                                <View style={styles.moduleInfoRow}>
                                    <View style={styles.infoBadge}>
                                        <Text style={styles.infoText}>
                                            Pass: {module.passingScore}%
                                        </Text>
                                    </View>

                                    <View style={styles.infoBadge}>
                                        <Text style={styles.infoText}>
                                            v{module.version}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </Pressable>
                    ))
                ) : !error ? (
                    <View style={styles.emptyCard}>
                        <View style={styles.emptyIcon}>
                            <Text style={styles.emptyIconText}>
                                📚
                            </Text>
                        </View>

                        <Text style={styles.emptyTitle}>
                            No training modules
                        </Text>

                        <Text style={styles.emptyText}>
                            Training modules will appear here when
                            they are available.
                        </Text>
                    </View>
                ) : null}
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

    centerContainer: {
        flex: 1,
        backgroundColor: COLORS.background,
        justifyContent: "center",
        alignItems: "center"
    },

    loadingText: {
        color: COLORS.textSecondary,
        marginTop: SPACING.md,
        fontSize: 15
    },

    header: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: SPACING.xl
    },

    backButton: {
        width: 46,
        height: 46,
        borderRadius: 23,
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        justifyContent: "center",
        alignItems: "center",
        marginRight: SPACING.md
    },

    backText: {
        color: COLORS.white,
        fontSize: 28,
        lineHeight: 30
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
        fontSize: 14,
        marginTop: 4
    },

    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: SPACING.md
    },

    sectionTitle: {
        color: COLORS.white,
        fontSize: 20,
        fontWeight: "800"
    },

    moduleCount: {
        color: COLORS.textSecondary,
        fontSize: 13
    },

    moduleCard: {
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
        padding: SPACING.md,
        marginBottom: SPACING.md,
        flexDirection: "row"
    },

    moduleCardPressed: {
        opacity: 0.75
    },

    moduleIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: "#173867",
        justifyContent: "center",
        alignItems: "center",
        marginRight: SPACING.md
    },

    moduleIconText: {
        fontSize: 26
    },

    moduleContent: {
        flex: 1
    },

    moduleTopRow: {
        flexDirection: "row",
        alignItems: "flex-start"
    },

    moduleTitle: {
        flex: 1,
        color: COLORS.white,
        fontSize: 17,
        fontWeight: "800",
        marginRight: SPACING.sm
    },

    arrow: {
        color: COLORS.secondary,
        fontSize: 24,
        fontWeight: "700"
    },

    moduleDescription: {
        color: COLORS.textSecondary,
        fontSize: 14,
        lineHeight: 20,
        marginTop: 6
    },

    moduleInfoRow: {
        flexDirection: "row",
        marginTop: SPACING.sm,
        gap: SPACING.sm
    },

    infoBadge: {
        backgroundColor: "#173867",
        borderRadius: RADIUS.sm,
        paddingHorizontal: 9,
        paddingVertical: 5
    },

    infoText: {
        color: COLORS.secondary,
        fontSize: 12,
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
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: "#173867",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: SPACING.md
    },

    emptyIconText: {
        fontSize: 32
    },

    emptyTitle: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: "800",
        marginBottom: 6
    },

    emptyText: {
        color: COLORS.textSecondary,
        fontSize: 14,
        textAlign: "center",
        lineHeight: 21
    },

    errorCard: {
        backgroundColor: "#2A1420",
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        borderColor: COLORS.danger,
        padding: SPACING.lg,
        marginBottom: SPACING.lg
    },

    errorTitle: {
        color: COLORS.danger,
        fontSize: 17,
        fontWeight: "800",
        marginBottom: 6
    },

    errorText: {
        color: COLORS.textSecondary,
        fontSize: 14,
        lineHeight: 20
    },

    retryButton: {
        marginTop: SPACING.md,
        backgroundColor: COLORS.danger,
        borderRadius: RADIUS.md,
        paddingVertical: 12,
        alignItems: "center"
    },

    retryText: {
        color: COLORS.white,
        fontWeight: "800"
    }
});