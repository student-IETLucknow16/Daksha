import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { completeTrainingFromUnity } from "../services/trainingResultService";
import { COLORS, SPACING } from "../constants/theme";

export default function TrainingResultScreen() {
    const router = useRouter();

    const params = useLocalSearchParams();

    const [error, setError] = useState("");

    useEffect(() => {
        const processTrainingResult = async () => {
            try {
                const moduleId = params.moduleId;
                const attemptId = params.attemptId;
                const score = Number(params.score);
                const result = params.result;

                let mistakes = [];

                if (params.mistakes) {
                    try {
                        mistakes =
                            typeof params.mistakes === "string"
                                ? JSON.parse(params.mistakes)
                                : params.mistakes;
                    } catch (parseError) {
                        console.warn(
                            "[TrainingResult] Could not parse mistakes:",
                            parseError
                        );

                        mistakes = [];
                    }
                }

                console.log(
                    "[TrainingResult] Module ID:",
                    moduleId
                );

                console.log(
                    "[TrainingResult] Attempt ID:",
                    attemptId
                );

                console.log(
                    "[TrainingResult] Score:",
                    score
                );

                console.log(
                    "[TrainingResult] Result:",
                    result
                );

                console.log(
                    "[TrainingResult] Mistakes:",
                    mistakes
                );

                if (
                    !moduleId ||
                    !attemptId ||
                    !Number.isFinite(score) ||
                    !result
                ) {
                    throw new Error(
                        "Training result data is missing or invalid."
                    );
                }

                console.log(
                    "[TrainingResult] Completing training attempt..."
                );

                const response =
                    await completeTrainingFromUnity(
                        attemptId,
                        score,
                        result,
                        mistakes
                    );

                console.log(
                    "[TrainingResult] Backend response:",
                    response
                );

                if (response?.success) {
                    if (result === "passed") {
                        console.log(
                            "[TrainingResult] Training passed. " +
                            "Opening assessment."
                        );

                        router.replace({
                            pathname:
                                "/worker/assessment/[moduleId]",
                            params: {
                                moduleId: String(moduleId),
                                attemptId: String(attemptId)
                            }
                        });
                    } else {
                        console.log(
                            "[TrainingResult] Training failed. " +
                            "Returning to dashboard."
                        );

                        router.replace(
                            "/worker/dashboard"
                        );
                    }

                    return;
                }

                throw new Error(
                    response?.message ||
                    "Failed to complete training attempt."
                );
            } catch (err) {
                console.error(
                    "[TrainingResult] Failed:",
                    err?.response?.data ||
                    err?.message ||
                    err
                );

                setError(
                    err?.response?.data?.message ||
                    err?.message ||
                    "Unable to process training result."
                );
            }
        };

        processTrainingResult();
    }, [
        params.moduleId,
        params.attemptId,
        params.score,
        params.result,
        params.mistakes
    ]);

    if (error) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorIcon}>
                    ⚠️
                </Text>

                <Text style={styles.title}>
                    Training Result Error
                </Text>

                <Text style={styles.errorText}>
                    {error}
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ActivityIndicator
                size="large"
                color={COLORS.secondary}
            />

            <Text style={styles.title}>
                Processing Training Result
            </Text>

            <Text style={styles.subtitle}>
                Please wait while we save your training result...
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        alignItems: "center",
        justifyContent: "center",
        padding: SPACING.xl
    },

    title: {
        color: COLORS.white,
        fontSize: 21,
        fontWeight: "800",
        textAlign: "center",
        marginTop: SPACING.lg
    },

    subtitle: {
        color: COLORS.textSecondary,
        fontSize: 14,
        textAlign: "center",
        lineHeight: 21,
        marginTop: SPACING.sm
    },

    errorIcon: {
        fontSize: 40
    },

    errorText: {
        color: COLORS.textSecondary,
        fontSize: 14,
        textAlign: "center",
        lineHeight: 21,
        marginTop: SPACING.md
    }
});

