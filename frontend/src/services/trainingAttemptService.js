import api from "./api";

export const startTrainingAttempt = async (moduleId) => {
    const response = await api.post("/training-attempts/start", {
        moduleId
    });

    return response.data;
};

export const completeTrainingAttempt = async (
    attemptId,
    trainingResult
) => {
    const response = await api.patch(
        `/training-attempts/${attemptId}/complete`,
        trainingResult
    );

    return response.data;
};