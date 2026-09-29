import api from "./api";
import {
    saveAuthData,
    clearAuthData
} from "./authStorage";

export const login = async (email, password) => {
    const response = await api.post("/auth/login", {
        email,
        password
    });

    const { token, user } = response.data;

    await saveAuthData(token, user);

    return response.data;
};

export const logout = async () => {
    await clearAuthData();
};

export const register = async (userData) => {
    const response = await api.post("/auth/register", userData);

    const { token, user } = response.data;

    await saveAuthData(token, user);

    return response.data;
};