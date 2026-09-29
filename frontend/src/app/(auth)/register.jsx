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

export default function RegisterScreen() {
    const router = useRouter();
    const { register } = useAuth();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phone, setPhone] = useState("");
    const [preferredLanguage, setPreferredLanguage] = useState("en");
    const [site, setSite] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleRegister = async () => {
        setError("");

        if (!name.trim()) {
            setError("Please enter your name.");
            return;
        }

        if (!email.trim()) {
            setError("Please enter your email.");
            return;
        }

        if (!password) {
            setError("Please enter a password.");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        try {
            setLoading(true);

            const data = await register({
                name: name.trim(),
                email: email.trim().toLowerCase(),
                password,
                phone: phone.trim(),
                preferredLanguage,
                site: site.trim()
            });

            console.log("REGISTRATION SUCCESS:", data);

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
            console.error("REGISTRATION ERROR:", error);

            const message =
                error?.response?.data?.message ||
                "Registration failed. Please try again.";

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
                {/* Header */}
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

                {/* Branding */}
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
                    Create Your Account
                </Text>

                <Text style={styles.subtitle}>
                    Start your mining safety training journey
                </Text>

                {/* Registration Card */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>
                        Worker Registration
                    </Text>

                    <Text style={styles.cardSubtitle}>
                        Create an account to access safety training
                    </Text>

                    {/* Name */}
                    <Text style={styles.label}>
                        Full Name *
                    </Text>

                    <View style={styles.inputContainer}>
                        <Text style={styles.inputIcon}>
                            👤
                        </Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Enter your full name"
                            placeholderTextColor="#71809A"
                            value={name}
                            onChangeText={setName}
                            autoCapitalize="words"
                            autoCorrect={false}
                        />
                    </View>

                    {/* Email */}
                    <Text style={styles.label}>
                        Email *
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
                        Password *
                    </Text>

                    <View style={styles.inputContainer}>
                        <Text style={styles.inputIcon}>
                            🔒
                        </Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Minimum 6 characters"
                            placeholderTextColor="#71809A"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                    </View>

                    {/* Phone */}
                    <Text style={styles.label}>
                        Phone
                    </Text>

                    <View style={styles.inputContainer}>
                        <Text style={styles.inputIcon}>
                            📱
                        </Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Enter your phone number"
                            placeholderTextColor="#71809A"
                            value={phone}
                            onChangeText={setPhone}
                            keyboardType="phone-pad"
                        />
                    </View>

                    {/* Language */}
                    <Text style={styles.label}>
                        Preferred Language
                    </Text>

                    <View style={styles.languageRow}>
                        <TouchableOpacity
                            style={[
                                styles.languageButton,
                                preferredLanguage === "en" &&
                                    styles.languageButtonActive
                            ]}
                            onPress={() =>
                                setPreferredLanguage("en")
                            }
                        >
                            <Text
                                style={[
                                    styles.languageText,
                                    preferredLanguage === "en" &&
                                        styles.languageTextActive
                                ]}
                            >
                                English
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.languageButton,
                                preferredLanguage === "hi" &&
                                    styles.languageButtonActive
                            ]}
                            onPress={() =>
                                setPreferredLanguage("hi")
                            }
                        >
                            <Text
                                style={[
                                    styles.languageText,
                                    preferredLanguage === "hi" &&
                                        styles.languageTextActive
                                ]}
                            >
                                हिंदी
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.languageButton,
                                preferredLanguage === "sat" &&
                                    styles.languageButtonActive
                            ]}
                            onPress={() =>
                                setPreferredLanguage("sat")
                            }
                        >
                            <Text
                                style={[
                                    styles.languageText,
                                    preferredLanguage === "sat" &&
                                        styles.languageTextActive
                                ]}
                            >
                                ᱥᱟᱱᱛᱟᱲᱤ
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Site */}
                    <Text style={styles.label}>
                        Mining Site
                    </Text>

                    <View style={styles.inputContainer}>
                        <Text style={styles.inputIcon}>
                            📍
                        </Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Enter your mining site"
                            placeholderTextColor="#71809A"
                            value={site}
                            onChangeText={setSite}
                            autoCapitalize="words"
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

                    {/* Register Button */}
                    <TouchableOpacity
                        style={[
                            styles.registerButton,
                            loading && styles.buttonDisabled
                        ]}
                        onPress={handleRegister}
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
                                    CREATE ACCOUNT
                                </Text>

                                <Text style={styles.arrow}>
                                    →
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>

                    {/* Login Link */}
                    <View style={styles.loginRow}>
                        <Text style={styles.loginText}>
                            Already have an account?
                        </Text>

                        <TouchableOpacity
                            onPress={() =>
                                router.replace(
                                    "/(auth)/login"
                                )
                            }
                        >
                            <Text style={styles.loginLink}>
                                Sign In
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Security */}
                <View style={styles.safetyRow}>
                    <Text style={styles.safetyIcon}>
                        🛡️
                    </Text>

                    <Text style={styles.safetyText}>
                        Your account and training data are securely protected.
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
        paddingTop: 25,
        paddingBottom: 30
    },

    hero: {
        width: 160,
        height: 145,
        alignItems: "center",
        justifyContent: "center",
        position: "relative"
    },

    glowOuter: {
        width: 125,
        height: 125,
        borderRadius: 63,
        backgroundColor: "rgba(255, 215, 0, 0.08)",
        alignItems: "center",
        justifyContent: "center"
    },

    glowInner: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: "rgba(255, 215, 0, 0.10)",
        borderWidth: 1,
        borderColor: "rgba(255, 215, 0, 0.25)",
        alignItems: "center",
        justifyContent: "center"
    },

    helmet: {
        fontSize: 65
    },

    warningBadge: {
        position: "absolute",
        right: 5,
        bottom: 8,
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: COLORS.background,
        borderWidth: 1,
        borderColor: COLORS.secondary,
        alignItems: "center",
        justifyContent: "center"
    },

    warning: {
        fontSize: 20
    },

    brandRow: {
        flexDirection: "row",
        alignItems: "center"
    },

    sih: {
        color: COLORS.secondary,
        fontSize: 34,
        fontWeight: "900",
        letterSpacing: 3
    },

    problemBadge: {
        marginLeft: 10,
        paddingHorizontal: 9,
        paddingVertical: 4,
        borderRadius: 7,
        borderWidth: 1,
        borderColor: COLORS.secondary,
        backgroundColor: "rgba(255, 215, 0, 0.06)"
    },

    problem: {
        color: COLORS.secondary,
        fontSize: 12,
        fontWeight: "800"
    },

    title: {
        color: COLORS.white,
        fontSize: 23,
        fontWeight: "800",
        textAlign: "center",
        marginTop: 8
    },

    subtitle: {
        color: COLORS.textSecondary,
        fontSize: 13,
        textAlign: "center",
        marginTop: 5,
        marginBottom: 20
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
        fontSize: 21,
        fontWeight: "800"
    },

    cardSubtitle: {
        color: COLORS.textSecondary,
        fontSize: 13,
        marginTop: 5,
        marginBottom: 5
    },

    label: {
        color: COLORS.white,
        fontSize: 14,
        fontWeight: "600",
        marginTop: 15,
        marginBottom: 7
    },

    inputContainer: {
        height: 50,
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

    languageRow: {
        flexDirection: "row",
        gap: 8
    },

    languageButton: {
        flex: 1,
        minHeight: 45,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: RADIUS.sm,
        backgroundColor: "rgba(4, 16, 41, 0.75)",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 5
    },

    languageButtonActive: {
        borderColor: COLORS.secondary,
        backgroundColor: "rgba(255, 215, 0, 0.10)"
    },

    languageText: {
        color: COLORS.textSecondary,
        fontSize: 12,
        fontWeight: "600",
        textAlign: "center"
    },

    languageTextActive: {
        color: COLORS.secondary
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

    registerButton: {
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
        fontSize: 14,
        fontWeight: "900",
        letterSpacing: 0.8
    },

    arrow: {
        color: COLORS.background,
        fontSize: 22,
        fontWeight: "700",
        marginLeft: 10
    },

    loginRow: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 20
    },

    loginText: {
        color: COLORS.textSecondary,
        fontSize: 13
    },

    loginLink: {
        color: COLORS.secondary,
        fontSize: 13,
        fontWeight: "800",
        marginLeft: 6
    },

    safetyRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 18,
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
    }
});