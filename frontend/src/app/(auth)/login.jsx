import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView
} from "react-native";

import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import {
    COLORS,
    SPACING,
    RADIUS
} from "../../constants/theme";

export default function LoginScreen() {
    const router = useRouter();
    const { login } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async () => {
        setError("");

        if (!email.trim() || !password) {
            setError("Please enter your email and password.");
            return;
        }

        try {
            setLoading(true);

            const data = await login(
                email.trim(),
                password
            );

            console.log("LOGIN SUCCESS:", data);

            if (data.user.role === "worker") {
                router.replace("/worker/dashboard");
            } else if (data.user.role === "admin") {
                router.replace("/admin/dashboard");
            } else if (data.user.role === "site_officer") {
                router.replace("/site-officer/dashboard");
            } else {
                setError("Unknown user role.");
            }
        } catch (error) {
            console.error("LOGIN ERROR:", error);

            const message =
                error?.response?.data?.message ||
                "Login failed. Please check your credentials.";

            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={
                Platform.OS === "ios"
                    ? "padding"
                    : undefined
            }
        >
            <ScrollView
                contentContainerStyle={styles.content}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* Safety Header */}
                <View style={styles.hero}>
                    <View style={styles.glowOuter}>
                        <View style={styles.glowInner}>
                            <Text style={styles.helmet}>
                                ⛑️
                            </Text>
                        </View>
                    </View>

                    <View style={styles.warningBadge}>
                        <Text style={styles.warning}>
                            ⚠️
                        </Text>
                    </View>
                </View>

                {/* SIH Branding */}
                <View style={styles.brandRow}>
                    <Text style={styles.sih}>
                        SIH
                    </Text>

                    <View style={styles.problemBadge}>
                        <Text style={styles.problem}>
                            26041
                        </Text>
                    </View>
                </View>

                <Text style={styles.title}>
                    Mining Safety Training
                </Text>

                <Text style={styles.subtitle}>
                    Learn • Train • Stay Safe
                </Text>

                {/* Login Card */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>
                        Welcome Back
                    </Text>

                    <Text style={styles.cardSubtitle}>
                        Sign in to continue your safety training
                    </Text>

                    {/* Email */}
                    <Text style={styles.label}>
                        Email
                    </Text>

                    <View style={styles.inputContainer}>
                        <Text style={styles.inputIcon}>
                            ✉️
                        </Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Enter your email"
                            placeholderTextColor="#71809A"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                    </View>

                    {/* Password */}
                    <Text style={styles.label}>
                        Password
                    </Text>

                    <View style={styles.inputContainer}>
                        <Text style={styles.inputIcon}>
                            🔒
                        </Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Enter your password"
                            placeholderTextColor="#71809A"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                    </View>

                    {/* Error */}
                    {error ? (
                        <View style={styles.errorBox}>
                            <Text style={styles.errorIcon}>
                                ⚠
                            </Text>

                            <Text style={styles.errorText}>
                                {error}
                            </Text>
                        </View>
                    ) : null}

                    {/* Login Button */}
                    <TouchableOpacity
                        style={[
                            styles.loginButton,
                            loading && styles.buttonDisabled
                        ]}
                        onPress={handleLogin}
                        disabled={loading}
                        activeOpacity={0.8}
                    >
                        {loading ? (
                            <ActivityIndicator
                                color={COLORS.background}
                            />
                        ) : (
                            <>
                                <Text style={styles.buttonText}>
                                    SIGN IN
                                </Text>

                                <Text style={styles.arrow}>
                                    →
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>

                    {/* Register Link */}
                    <View style={styles.registerRow}>
                        <Text style={styles.registerText}>
                            Don't have an account?
                        </Text>

                        <TouchableOpacity
                            onPress={() =>
                                router.push(
                                    "/(auth)/register"
                                )
                            }
                        >
                            <Text style={styles.registerLink}>
                                Register
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Certificate Verification Link */}
<TouchableOpacity
    style={styles.verifyCertificateButton}
    onPress={() => router.push("/verify-certificate")}
    activeOpacity={0.8}
>
    <Text style={styles.verifyCertificateIcon}>
        🔍
    </Text>

    <Text style={styles.verifyCertificateText}>
        Verify Certificate
    </Text>
</TouchableOpacity>

                {/* Safety Information */}
                <View style={styles.safetyRow}>
                    <Text style={styles.safetyIcon}>
                        🛡️
                    </Text>

                    <Text style={styles.safetyText}>
                        Your safety training data is securely protected.
                    </Text>
                </View>

                {/* Footer */}
                <Text style={styles.footer}>
                    AR-Based Mining Safety & Certification
                </Text>

                <Text style={styles.footerSmall}>
                    SIH 2026 • Problem Statement 26041
                </Text>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background
    },

    content: {
        flexGrow: 1,
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 35,
        paddingBottom: 30
    },

    hero: {
        width: 190,
        height: 175,
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        marginBottom: 5
    },

    glowOuter: {
        width: 155,
        height: 155,
        borderRadius: 78,
        backgroundColor: "rgba(255, 215, 0, 0.08)",
        alignItems: "center",
        justifyContent: "center"
    },

    glowInner: {
        width: 125,
        height: 125,
        borderRadius: 63,
        backgroundColor: "rgba(255, 215, 0, 0.10)",
        borderWidth: 1,
        borderColor: "rgba(255, 215, 0, 0.25)",
        alignItems: "center",
        justifyContent: "center"
    },

    helmet: {
        fontSize: 82
    },

    warningBadge: {
        position: "absolute",
        right: 8,
        bottom: 15,
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: COLORS.background,
        borderWidth: 1,
        borderColor: COLORS.secondary,
        alignItems: "center",
        justifyContent: "center"
    },

    warning: {
        fontSize: 24
    },

    brandRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center"
    },

    sih: {
        color: COLORS.secondary,
        fontSize: 40,
        fontWeight: "900",
        letterSpacing: 3
    },

    problemBadge: {
        marginLeft: 10,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.secondary,
        backgroundColor: "rgba(255, 215, 0, 0.06)"
    },

    problem: {
        color: COLORS.secondary,
        fontSize: 13,
        fontWeight: "800"
    },

    title: {
        color: COLORS.white,
        fontSize: 25,
        fontWeight: "800",
        textAlign: "center",
        marginTop: 8
    },

    subtitle: {
        color: COLORS.textSecondary,
        fontSize: 14,
        textAlign: "center",
        marginTop: 6,
        marginBottom: 24
    },

    card: {
        width: "100%",
        maxWidth: 450,
        backgroundColor: "rgba(11, 43, 106, 0.55)",
        borderRadius: RADIUS.xl,
        borderWidth: 1,
        borderColor: COLORS.border,
        padding: 22
    },

    cardTitle: {
        color: COLORS.white,
        fontSize: 22,
        fontWeight: "800"
    },

    cardSubtitle: {
        color: COLORS.textSecondary,
        fontSize: 13,
        marginTop: 5,
        marginBottom: 8
    },

    label: {
        color: COLORS.white,
        fontSize: 14,
        fontWeight: "600",
        marginTop: 17,
        marginBottom: 7
    },

    inputContainer: {
        height: 52,
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: RADIUS.md,
        backgroundColor: "rgba(4, 16, 41, 0.75)",
        paddingHorizontal: 13
    },

    inputIcon: {
        fontSize: 17,
        marginRight: 10
    },

    input: {
        flex: 1,
        height: "100%",
        color: COLORS.white,
        fontSize: 15
    },

    errorBox: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 15,
        padding: 10,
        borderRadius: RADIUS.sm,
        backgroundColor: "rgba(239, 68, 68, 0.12)",
        borderWidth: 1,
        borderColor: COLORS.danger
    },

    errorIcon: {
        color: COLORS.danger,
        fontSize: 17,
        marginRight: 8
    },

    errorText: {
        flex: 1,
        color: COLORS.danger,
        fontSize: 13
    },

    loginButton: {
        height: 54,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: COLORS.secondary,
        borderRadius: RADIUS.md,
        marginTop: 24
    },

    buttonDisabled: {
        opacity: 0.6
    },

    buttonText: {
        color: COLORS.background,
        fontSize: 15,
        fontWeight: "900",
        letterSpacing: 1
    },

    arrow: {
        color: COLORS.background,
        fontSize: 22,
        fontWeight: "700",
        marginLeft: 10
    },

    registerRow: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 20
    },

    registerText: {
        color: COLORS.textSecondary,
        fontSize: 13
    },

    registerLink: {
        color: COLORS.secondary,
        fontSize: 13,
        fontWeight: "800",
        marginLeft: 6
    },

    safetyRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 20,
        paddingHorizontal: 15
    },

    safetyIcon: {
        fontSize: 18,
        marginRight: 7
    },

    safetyText: {
        color: "#71809A",
        fontSize: 11,
        textAlign: "center",
        flexShrink: 1
    },

    footer: {
        color: "#6F7F99",
        fontSize: 11,
        marginTop: 18,
        textAlign: "center"
    },

    footerSmall: {
        color: "#4E5C73",
        fontSize: 10,
        marginTop: 5,
        textAlign: "center"
    },
    verifyCertificateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.secondary,
    borderRadius: RADIUS.md,
    backgroundColor: "rgba(255, 215, 0, 0.05)"
},

verifyCertificateIcon: {
    fontSize: 16,
    marginRight: 7
},

verifyCertificateText: {
    color: COLORS.secondary,
    fontSize: 13,
    fontWeight: "800"
},
});

