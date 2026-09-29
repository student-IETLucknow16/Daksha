import React from "react";
import { Redirect } from "expo-router";
import { useAuth } from "../context/AuthContext";

export default function Index() {
    const {
        user,
        isAuthenticated,
        loading
    } = useAuth();

    if (loading) {
        return null;
    }

    if (!isAuthenticated) {
        return <Redirect href="/(auth)/login" />;
    }

    if (user?.role === "worker") {
        return <Redirect href="/worker/dashboard" />;
    }

    if (user?.role === "admin") {
        return <Redirect href="/admin/dashboard" />;
    }

    if (user?.role === "site_officer") {
        return <Redirect href="/site-officer/dashboard" />;
    }

    return <Redirect href="/(auth)/login" />;
}