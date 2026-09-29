import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { COLORS, SPACING, RADIUS } from "../../../constants/theme";
import {
    getAssessmentQuestions,
    submitAssessment
} from "../../../services/assessmentService";
import { useAuth } from "../../../context/AuthContext";
import { getAssessmentText } from "../../../services/assessmentLocalization";

export default function AssessmentScreen() {
    const { moduleId, attemptId } = useLocalSearchParams();
    const router = useRouter();

    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        loadQuestions();
    }, [moduleId]);

    const { user } = useAuth();

    const language =
    user?.preferredLanguage || "en";

    const loadQuestions = async () => {
        try {
            setLoading(true);
            setError("");

            const data =
                await getAssessmentQuestions(moduleId);

            if (data?.success) {
                setQuestions(data.questions || []);
            } else {
                setError(
                    data?.message ||
                    "Unable to load assessment."
                );
            }
        } catch (err) {
            console.error(
                "Failed to load assessment:",
                err
            );

            setError(
                err?.response?.data?.message ||
                "Unable to load assessment."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleSelectAnswer = (
        questionId,
        optionIndex
    ) => {
        setAnswers((previous) => ({
            ...previous,
            [questionId]: optionIndex
        }));
    };

    const handleSubmit = async () => {
        if (!attemptId) {
            Alert.alert(
                "Error",
                "Training attempt ID is missing."
            );
            return;
        }

        if (questions.length === 0) {
            return;
        }

        const unansweredQuestions =
            questions.filter(
                (question) =>
                    answers[question.questionId] ===
                    undefined
            );

        if (unansweredQuestions.length > 0) {
            Alert.alert(
                "Incomplete Assessment",
                `Please answer all questions. ${unansweredQuestions.length} question(s) remaining.`
            );
            return;
        }

        try {
            setSubmitting(true);

            const formattedAnswers =
                questions.map((question) => ({
                    questionId:
                        question.questionId,
                    selectedOptionIndex:
                        answers[question.questionId]
                }));

            const data = await submitAssessment(
                moduleId,
                attemptId,
                formattedAnswers
            );

            console.log(
                "ASSESSMENT RESULT:",
                data
            );

            if (data?.success) {
             router.replace({
    pathname: "/worker/assessment-result",
    params: {
        moduleId,
        attemptId,
        assessmentAttemptId: data.assessment.id,
        quizScore: String(data.assessment.quizScore),
        passed: String(data.assessment.passed),
        correctAnswers: String(data.assessment.correctAnswers),
        totalQuestions: String(data.assessment.totalQuestions)
    }
});
            }
        } catch (err) {
            console.error(
                "Assessment submission failed:",
                err
            );

            Alert.alert(
                "Assessment Failed",
                err?.response?.data?.message ||
                "Unable to submit assessment."
            );
        } finally {
            setSubmitting(false);
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
                    Loading assessment...
                </Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.center}>
                <Text style={styles.errorTitle}>
                    Assessment Unavailable
                </Text>

                <Text style={styles.errorText}>
                    {error}
                </Text>

                <TouchableOpacity
                    style={styles.retryButton}
                    onPress={loadQuestions}
                >
                    <Text style={styles.retryText}>
                        Retry
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView
                contentContainerStyle={
                    styles.scrollContent
                }
            >
                <Text style={styles.title}>
                    Safety Assessment
                </Text>

                <Text style={styles.subtitle}>
                    Answer all questions to complete
                    your training.
                </Text>

                <View style={styles.progressCard}>
                    <Text style={styles.progressText}>
                        {
                            Object.keys(answers).length
                        } / {questions.length} answered
                    </Text>
                </View>

                {questions.map(
                    (question, questionIndex) => (
                        <View
                            key={
                                question.questionId
                            }
                            style={styles.questionCard}
                        >
                            <Text
                                style={
                                    styles.questionNumber
                                }
                            >
                                Question{" "}
                                {questionIndex + 1}
                            </Text>

                            <Text
                                style={
                                    styles.questionText
                                }
                            >
                               {getAssessmentText(
                              question.questionKey,
                                      language
                                )}
                            </Text>

                            {question.options.map(
                                (
                                    option,
                                    optionIndex
                                ) => {
                                    const selected =
                                        answers[
                                            question
                                                .questionId
                                        ] ===
                                        optionIndex;

                                    return (
                                        <TouchableOpacity
                                            key={
                                                optionIndex
                                            }
                                            style={[
                                                styles.option,
                                                selected &&
                                                    styles.selectedOption
                                            ]}
                                            onPress={() =>
                                                handleSelectAnswer(
                                                    question.questionId,
                                                    optionIndex
                                                )
                                            }
                                            activeOpacity={
                                                0.8
                                            }
                                        >
                                            <View
                                                style={[
                                                    styles.radio,
                                                    selected &&
                                                        styles.radioSelected
                                                ]}
                                            >
                                                {selected && (
                                                    <View
                                                        style={
                                                            styles.radioDot
                                                        }
                                                    />
                                                )}
                                            </View>

                                            <Text
                                                style={[
                                                    styles.optionText,
                                                    selected &&
                                                        styles.selectedOptionText
                                                ]}
                                            >
                                               {getAssessmentText(
                                                option,
                                               language
                                                )}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                }
                            )}
                        </View>
                    )
                )}

                <TouchableOpacity
                    style={[
                        styles.submitButton,
                        submitting &&
                            styles.disabledButton
                    ]}
                    onPress={handleSubmit}
                    disabled={submitting}
                >
                    {submitting ? (
                        <ActivityIndicator
                            color={
                                COLORS.background
                            }
                        />
                    ) : (
                        <Text
                            style={
                                styles.submitText
                            }
                        >
                            Submit Assessment
                        </Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background
    },

    scrollContent: {
        padding: SPACING.lg,
        paddingBottom: SPACING.xl * 2
    },

    center: {
        flex: 1,
        backgroundColor: COLORS.background,
        justifyContent: "center",
        alignItems: "center",
        padding: SPACING.lg
    },

    loadingText: {
        color: COLORS.textSecondary,
        marginTop: SPACING.md,
        fontSize: 15
    },

    title: {
        color: COLORS.white,
        fontSize: 28,
        fontWeight: "700",
        marginBottom: SPACING.sm
    },

    subtitle: {
        color: COLORS.textSecondary,
        fontSize: 15,
        marginBottom: SPACING.lg
    },

    progressCard: {
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: RADIUS.md,
        padding: SPACING.md,
        marginBottom: SPACING.lg
    },

    progressText: {
        color: COLORS.secondary,
        fontSize: 15,
        fontWeight: "600"
    },

    questionCard: {
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: RADIUS.lg,
        padding: SPACING.lg,
        marginBottom: SPACING.lg
    },

    questionNumber: {
        color: COLORS.secondary,
        fontSize: 13,
        fontWeight: "700",
        marginBottom: SPACING.sm
    },

    questionText: {
        color: COLORS.white,
        fontSize: 17,
        lineHeight: 24,
        fontWeight: "600",
        marginBottom: SPACING.md
    },

    option: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: COLORS.background,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: RADIUS.md,
        padding: SPACING.md,
        marginTop: SPACING.sm
    },

    selectedOption: {
        borderColor: COLORS.secondary
    },

    radio: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: COLORS.textSecondary,
        justifyContent: "center",
        alignItems: "center",
        marginRight: SPACING.md
    },

    radioSelected: {
        borderColor: COLORS.secondary
    },

    radioDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: COLORS.secondary
    },

    optionText: {
        flex: 1,
        color: COLORS.textSecondary,
        fontSize: 15,
        lineHeight: 21
    },

    selectedOptionText: {
        color: COLORS.white,
        fontWeight: "600"
    },

    submitButton: {
        backgroundColor: COLORS.secondary,
        borderRadius: RADIUS.md,
        padding: SPACING.md,
        minHeight: 52,
        justifyContent: "center",
        alignItems: "center",
        marginTop: SPACING.md
    },

    disabledButton: {
        opacity: 0.6
    },

    submitText: {
        color: COLORS.background,
        fontSize: 16,
        fontWeight: "800"
    },

    errorTitle: {
        color: COLORS.white,
        fontSize: 22,
        fontWeight: "700",
        marginBottom: SPACING.sm
    },

    errorText: {
        color: COLORS.danger,
        textAlign: "center",
        fontSize: 15,
        marginBottom: SPACING.lg
    },

    retryButton: {
        backgroundColor: COLORS.secondary,
        paddingHorizontal: SPACING.xl,
        paddingVertical: SPACING.md,
        borderRadius: RADIUS.md
    },

    retryText: {
        color: COLORS.background,
        fontWeight: "700"
    }
});