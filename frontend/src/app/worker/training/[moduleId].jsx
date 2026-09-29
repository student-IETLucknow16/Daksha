import React, { useCallback, useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
    ActivityIndicator
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { COLORS, SPACING, RADIUS } from "../../../constants/theme";
import { getTrainingModule } from "../../../services/trainingService";
import { startTrainingAttempt } from "../../../services/trainingAttemptService";
import { launchUnityTraining } from "../../../services/unityService";

export default function TrainingModuleDetailsScreen() {
    const router = useRouter();
    const { moduleId } = useLocalSearchParams();

    const [module, setModule] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [starting, setStarting] = useState(false);

    const loadModule = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getTrainingModule(moduleId);

            setModule(data?.module || null);
        } catch (err) {
            console.error("Failed to load training module:", err);

            setError(
                err?.response?.data?.message ||
                "Unable to load this training module."
            );
        } finally {
            setLoading(false);
        }
    }, [moduleId]);

    const handleStartTraining = async () => {
    try {
        setStarting(true);

        const data = await startTrainingAttempt(module.moduleId);

        console.log("TRAINING ATTEMPT CREATED:", data);

        if (data?.success && data?.attempt) {
            console.log("Attempt ID:", data.attempt.id);
            console.log("Module ID:", data.attempt.moduleId);

             launchUnityTraining(
        data.attempt.moduleId,
        data.attempt.id
    );
        }
    } catch (err) {
        console.error(
            "Failed to start training:",
            err
        );

        setError(
            err?.response?.data?.message ||
            "Unable to start training."
        );
    } finally {
        setStarting(false);
    }
};

    useEffect(() => {
        if (moduleId) {
            loadModule();
        }
    }, [moduleId, loadModule]);

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator
                    size="large"
                    color={COLORS.secondary}
                />

                <Text style={styles.loadingText}>
                    Loading module...
                </Text>
            </View>
        );
    }

    if (error || !module) {
        return (
            <View style={styles.centerContainer}>
                <View style={styles.errorIcon}>
                    <Text style={styles.errorIconText}>⚠️</Text>
                </View>

                <Text style={styles.errorTitle}>
                    Module unavailable
                </Text>

                <Text style={styles.errorText}>
                    {error || "Training module could not be found."}
                </Text>

                <Pressable
                    style={styles.backButtonLarge}
                    onPress={() => router.back()}
                >
                    <Text style={styles.backButtonText}>
                        Back to Training
                    </Text>
                </Pressable>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Pressable
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <Text style={styles.backText}>←</Text>
                    </Pressable>

                    <Text style={styles.headerTitle}>
                        Training Details
                    </Text>
                </View>

                {/* Module Hero */}
                <View style={styles.heroCard}>
                    <View style={styles.heroIcon}>
                        <Text style={styles.heroIconText}>
                            🛡️
                        </Text>
                    </View>

                    <Text style={styles.moduleTitle}>
                        {module.title}
                    </Text>

                    <Text style={styles.moduleId}>
                        Module ID: {module.moduleId}
                    </Text>
                </View>

                {/* Description */}
                <Text style={styles.sectionTitle}>
                    About this training
                </Text>

                <View style={styles.card}>
                    <Text style={styles.description}>
                        {module.description ||
                            "This module provides practical safety training for mining workers."}
                    </Text>
                </View>

                {/* Training Information */}
                <Text style={styles.sectionTitle}>
                    Training Information
                </Text>

                <View style={styles.infoGrid}>
                    <View style={styles.infoCard}>
                        <Text style={styles.infoLabel}>
                            Passing Score
                        </Text>

                        <Text style={styles.infoValue}>
                            {module.passingScore}%
                        </Text>
                    </View>

                    <View style={styles.infoCard}>
                        <Text style={styles.infoLabel}>
                            Version
                        </Text>

                        <Text style={styles.infoValue}>
                            {module.version}
                        </Text>
                    </View>
                </View>

                {/* AR Training Information */}
                <Text style={styles.sectionTitle}>
                    AR Safety Training
                </Text>

                <View style={styles.arCard}>
                    <View style={styles.arIcon}>
                        <Text style={styles.arIconText}>
                            📱
                        </Text>
                    </View>

                    <View style={styles.arContent}>
                        <Text style={styles.arTitle}>
                            Interactive AR Scenario
                        </Text>

                        <Text style={styles.arDescription}>
                            You will enter an augmented reality
                            safety scenario and complete the required
                            safety actions.
                        </Text>
                    </View>
                </View>

                {/* Start Button */}
              <Pressable
    style={[
        styles.startButton,
        starting && styles.startButtonDisabled
    ]}
    onPress={handleStartTraining}
    disabled={starting}
>
    {starting ? (
        <ActivityIndicator
            size="small"
            color="#041029"
        />
    ) : (
        <Text style={styles.startButtonIcon}>
            🎯
        </Text>
    )}

    <Text style={styles.startButtonText}>
        {starting
            ? "Starting Training..."
            : "Start AR Training"}
    </Text>

    {!starting && (
        <Text style={styles.startButtonArrow}>
            →
        </Text>
    )}
</Pressable>
                 

                <Text style={styles.notice}>
                    Make sure you have enough space to safely use
                    your phone during AR training.
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

    centerContainer: {
        flex: 1,
        backgroundColor: COLORS.background,
        justifyContent: "center",
        alignItems: "center",
        padding: SPACING.xl
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
        fontSize: 28
    },

    headerTitle: {
        color: COLORS.white,
        fontSize: 22,
        fontWeight: "800"
    },

    heroCard: {
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.xl,
        borderWidth: 1,
        borderColor: COLORS.border,
        padding: SPACING.xl,
        alignItems: "center",
        marginBottom: SPACING.xl
    },

    heroIcon: {
        width: 82,
        height: 82,
        borderRadius: 41,
        backgroundColor: "#173867",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: SPACING.md
    },

    heroIconText: {
        fontSize: 38
    },

    moduleTitle: {
        color: COLORS.white,
        fontSize: 25,
        fontWeight: "800",
        textAlign: "center"
    },

    moduleId: {
        color: COLORS.textSecondary,
        fontSize: 13,
        marginTop: 7
    },

    sectionTitle: {
        color: COLORS.white,
        fontSize: 20,
        fontWeight: "800",
        marginBottom: SPACING.md,
        marginTop: SPACING.sm
    },

    card: {
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
        padding: SPACING.lg,
        marginBottom: SPACING.xl
    },

    description: {
        color: COLORS.textSecondary,
        fontSize: 15,
        lineHeight: 23
    },

    infoGrid: {
        flexDirection: "row",
        gap: SPACING.md,
        marginBottom: SPACING.xl
    },

    infoCard: {
        flex: 1,
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
        padding: SPACING.lg
    },

    infoLabel: {
        color: COLORS.textSecondary,
        fontSize: 13,
        marginBottom: 8
    },

    infoValue: {
        color: COLORS.secondary,
        fontSize: 24,
        fontWeight: "800"
    },

    arCard: {
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
        padding: SPACING.lg,
        flexDirection: "row",
        marginBottom: SPACING.xl
    },

    arIcon: {
        width: 54,
        height: 54,
        borderRadius: 27,
        backgroundColor: "#173867",
        justifyContent: "center",
        alignItems: "center",
        marginRight: SPACING.md
    },

    arIconText: {
        fontSize: 25
    },

    arContent: {
        flex: 1
    },

    arTitle: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: "800",
        marginBottom: 5
    },

    arDescription: {
        color: COLORS.textSecondary,
        fontSize: 13,
        lineHeight: 19
    },

    startButton: {
        backgroundColor: COLORS.secondary,
        borderRadius: RADIUS.lg,
        minHeight: 58,
        paddingHorizontal: SPACING.lg,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center"
    },

    startButtonIcon: {
        fontSize: 21,
        marginRight: 10
    },

    startButtonText: {
        color: "#041029",
        fontSize: 17,
        fontWeight: "900"
    },

    startButtonArrow: {
        color: "#041029",
        fontSize: 25,
        fontWeight: "800",
        marginLeft: 12
    },

    notice: {
        color: "#7F8DA8",
        fontSize: 12,
        lineHeight: 18,
        textAlign: "center",
        marginTop: SPACING.md
    },

    errorIcon: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: "#2A1420",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: SPACING.md
    },

    errorIconText: {
        fontSize: 30
    },

    errorTitle: {
        color: COLORS.white,
        fontSize: 21,
        fontWeight: "800",
        marginBottom: 8
    },

    errorText: {
        color: COLORS.textSecondary,
        fontSize: 14,
        textAlign: "center",
        lineHeight: 21,
        marginBottom: SPACING.lg
    },

    backButtonLarge: {
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.md,
        borderWidth: 1,
        borderColor: COLORS.border,
        paddingHorizontal: SPACING.xl,
        paddingVertical: 13
    },

    backButtonText: {
        color: COLORS.white,
        fontWeight: "800"
    },

    startButtonDisabled: {
    opacity: 0.7
}
});