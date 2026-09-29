import api from "./api";

export const getAssessmentQuestions = async (moduleId) => {
    const response = await api.get(
        `/assessment/${moduleId}/questions`
    );

    return response.data;
};

export const submitAssessment = async (
    moduleId,
    trainingAttemptId,
    answers
) => {
    const response = await api.post(
        "/assessment/submit",
        {
            moduleId,
            trainingAttemptId,
            answers
        }
    );

    return response.data;
};