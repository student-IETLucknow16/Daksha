import api from "./api";

export const createCertification = async (
    trainingAttemptId,
    assessmentAttemptId
) => {
    const response = await api.post("/certifications", {
        trainingAttemptId,
        assessmentAttemptId
    });

    return response.data;
};

export const verifyCertification = async (
    certificateId
) => {
    const response = await api.get(
        `/certifications/verify/${certificateId}`
    );

    return response.data;
};