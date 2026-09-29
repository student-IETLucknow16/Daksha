import React, {
    createContext,
    useContext,
    useEffect,
    useState
} from "react";

import {
    getUser,
    getToken,
    clearAuthData
} from "../services/authStorage";

import {
     register as registerService,
    login as loginService,
    logout as logoutService
} from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStoredAuth();
    }, []);

    const loadStoredAuth = async () => {
        try {
            const storedToken = await getToken();
            const storedUser = await getUser();

            if (storedToken && storedUser) {
                setToken(storedToken);
                setUser(storedUser);
            }
        } catch (error) {
            console.error("Failed to load stored authentication:", error);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        const data = await loginService(email, password);

        setToken(data.token);
        setUser(data.user);

        return data;
    };

    const register = async (userData) => {
    const data = await registerService(userData);

    setToken(data.token);
    setUser(data.user);

    return data;
};

    const logout = async () => {
        await logoutService();

        setToken(null);
        setUser(null);
    };

    const value = {
        user,
        token,
        loading,
        isAuthenticated: !!token && !!user,
        login,
         register,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used inside AuthProvider");
    }

    return context;
};