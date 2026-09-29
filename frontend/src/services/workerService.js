import api from "./api";

export const getWorkerDashboard = async () => {
    const response = await api.get("/worker/dashboard");
    return response.data;
};

export const getWorkerProfile = async () => {
    const response = await api.get("/worker/profile");
    return response.data;
};

export const getWorkerProgress = async () => {
    const response = await api.get("/worker/progress");
    return response.data;
};

export const getWorkerCertificates = async () => {
    const response = await api.get("/worker/certificates");
    return response.data;
};

export const getWorkerTrainingHistory = async () => {
    const response = await api.get("/worker/training-history");
    return response.data;
};

export const getWorkerAssessmentHistory = async () => {
    const response = await api.get("/worker/assessment-history");
    return response.data;
};