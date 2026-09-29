import api from "./api";

export const completeTrainingFromUnity = async (
    attemptId,
    score,
    result,
    mistakes
) => {
    const response = await api.patch(
        `/training-attempts/${attemptId}/complete`,
        {
            scenarioScore: score,
            result,
            mistakes
        }
    );

    return response.data;
};