import api from "./api";

export const getTrainingModules = async () => {
    const response = await api.get("/training");
    return response.data;
};

export const getTrainingModule = async (moduleId) => {
    const response = await api.get(`/training/${moduleId}`);
    return response.data;
};