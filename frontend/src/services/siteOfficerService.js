
import api from "./api";

export const getSiteOfficerDashboard = async () => {
    const response = await api.get("/site-officer/dashboard");
    return response.data;
};

export const getSiteOfficerWorkers = async () => {
    const response = await api.get("/site-officer/workers");
    return response.data;
};

export const getSiteOfficerWorker = async (workerId) => {
    const response = await api.get(
        `/site-officer/workers/${workerId}`
    );
    return response.data;
};

export const getSiteOfficerTraining = async () => {
    const response = await api.get("/site-officer/training");
    return response.data;
};

export const getSiteOfficerAssessments = async () => {
    const response = await api.get("/site-officer/assessments");
    return response.data;
};

export const getSiteOfficerCertifications = async () => {
    const response = await api.get("/site-officer/certifications");
    return response.data;
};

export const getSiteOfficerAnalytics = async () => {
    const response = await api.get("/site-officer/analytics");
    return response.data;
};

