import api from "./api";

export const getAdminDashboard = async () => {
    const response = await api.get(
        "/admin/dashboard"
    );

    return response.data;
};

export const getAdminWorkers = async () => {
    const response = await api.get(
        "/admin/workers"
    );

    return response.data;
};

export const getAdminWorker = async (workerId) => {
    const response = await api.get(
        `/admin/workers/${workerId}`
    );

    return response.data;
};

export const getAdminTraining = async () => {
    const response = await api.get(
        "/admin/training"
    );

    return response.data;
};

export const getAdminAssessments = async () => {
    const response = await api.get(
        "/admin/assessments"
    );

    return response.data;
};

export const getAdminCertifications = async () => {
    const response = await api.get(
        "/admin/certifications"
    );

    return response.data;
};

export const getAdminAnalytics = async () => {
    const response = await api.get(
        "/admin/analytics"
    );

    return response.data;
};

