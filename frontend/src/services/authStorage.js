import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

const setItem = async (key, value) => {
    if (Platform.OS === "web") {
        localStorage.setItem(key, value);
        return;
    }

    await SecureStore.setItemAsync(key, value);
};

const getItem = async (key) => {
    if (Platform.OS === "web") {
        return localStorage.getItem(key);
    }

    return await SecureStore.getItemAsync(key);
};

const deleteItem = async (key) => {
    if (Platform.OS === "web") {
        localStorage.removeItem(key);
        return;
    }

    await SecureStore.deleteItemAsync(key);
};

export const saveAuthData = async (token, user) => {
    await setItem(TOKEN_KEY, token);
    await setItem(USER_KEY, JSON.stringify(user));
};

export const getToken = async () => {
    return await getItem(TOKEN_KEY);
};

export const getUser = async () => {
    const user = await getItem(USER_KEY);

    if (!user) {
        return null;
    }

    return JSON.parse(user);
};

export const clearAuthData = async () => {
    await deleteItem(TOKEN_KEY);
    await deleteItem(USER_KEY);
};