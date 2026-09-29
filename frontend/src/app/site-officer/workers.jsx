
import React, {
    useCallback,
    useEffect,
    useState
} from "react";

import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";

import { useRouter } from "expo-router";

import { getSiteOfficerWorkers } from "../../services/siteOfficerService";

import {
    COLORS,
    RADIUS,
    SPACING
} from "../../constants/theme";

export default function SiteOfficerWorkers() {
    const router = useRouter();

    const [workers, setWorkers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    const loadWorkers = async () => {
        try {
            setError("");

            const data = await getSiteOfficerWorkers();

            console.log("SITE OFFICER WORKERS:", data);

            const workerList =
                data?.workers ||
                data?.users ||
                data?.data ||
                [];

            setWorkers(
                Array.isArray(workerList)
                    ? workerList
                    : []
            );
        } catch (err) {
            console.error(
                "SITE OFFICER WORKERS ERROR:",
                err
            );

            setError(
                err?.response?.data?.message ||
                "Unable to load workers."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadWorkers();
    }, []);

    const handleRefresh = useCallback(() => {
        setRefreshing(true);
        loadWorkers();
    }, []);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator
                    size="large"
                    color={COLORS.secondary}
                />

                <Text style={styles.loadingText}>
                    Loading workers...
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.content}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        tintColor={COLORS.secondary}
                    />
                }
            >
                {/* HEADER */}

                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <TouchableOpacity
                            style={styles.backButtonContainer}
                            onPress={() =>
                                router.replace(
                                    "/site-officer/dashboard"
                                )
                            }
                        >
                            <Text style={styles.backButton}>
                                ‹
                            </Text>
                        </TouchableOpacity>

                        <View style={styles.headerTextContainer}>
                            <Text style={styles.title}>
                                Workers
                            </Text>

                            <Text style={styles.subtitle}>
                                Workers assigned to your site
                            </Text>
                        </View>
                    </View>

                    <View style={styles.countBadge}>
                        <Text style={styles.countText}>
                            {workers.length}
                        </Text>
                    </View>
                </View>

                {/* ERROR */}

                {error ? (
                    <View style={styles.errorCard}>
                        <Text style={styles.errorTitle}>
                            Unable to load workers
                        </Text>

                        <Text style={styles.errorText}>
                            {error}
                        </Text>

                        <TouchableOpacity
                            style={styles.retryButton}
                            onPress={loadWorkers}
                        >
                            <Text style={styles.retryText}>
                                Retry
                            </Text>
                        </TouchableOpacity>
                    </View>
                ) : null}

                {/* SUMMARY */}

                <View style={styles.summaryCard}>
                    <View style={styles.summaryIcon}>
                        <Text style={styles.summaryIconText}>
                            👥
                        </Text>
                    </View>

                    <View style={styles.summaryContent}>
                        <Text style={styles.summaryTitle}>
                            Site Workforce
                        </Text>

                        <Text style={styles.summaryText}>
                            {workers.length} worker
                            {workers.length === 1 ? "" : "s"}{" "}
                            currently visible for your assigned site.
                        </Text>
                    </View>
                </View>

                {/* WORKERS */}

                <Text style={styles.sectionTitle}>
                    Worker List
                </Text>

                {workers.length > 0 ? (
                    workers.map((worker, index) => {
                        const workerId =
                            worker._id ||
                            worker.id ||
                            worker.workerId;

                        const workerName =
                            worker.name ||
                            "Unnamed Worker";

                        const email =
                            worker.email ||
                            "No email available";

                        const phone =
                            worker.phone ||
                            "No phone available";

                        const site =
                            worker.site ||
                            "Site not specified";

                        const language =
                            worker.preferredLanguage ||
                            worker.language ||
                            "en";

                        const role =
                            worker.role ||
                            "worker";

                        const isActive =
                            worker.isActive !== false;

                        return (
                            <TouchableOpacity
                                key={
                                    workerId ||
                                    `worker-${index}`
                                }
                                style={styles.workerCard}
                                activeOpacity={0.8}
                                onPress={() => {
                                    if (!workerId) {
                                        return;
                                    }

                                    router.push({
                                        pathname:
                                            "/site-officer/workers/[id]",
                                        params: {
                                            id: String(workerId)
                                        }
                                    });
                                }}
                            >
                                {/* AVATAR */}

                                <View style={styles.avatar}>
                                    <Text
                                        style={styles.avatarText}
                                    >
                                        {workerName
                                            .charAt(0)
                                            .toUpperCase()}
                                    </Text>
                                </View>

                                {/* INFO */}

                                <View style={styles.workerInfo}>
                                    <Text
                                        style={styles.workerName}
                                        numberOfLines={1}
                                    >
                                        {workerName}
                                    </Text>

                                    <Text
                                        style={styles.workerEmail}
                                        numberOfLines={1}
                                    >
                                        {email}
                                    </Text>

                                    <View
                                        style={
                                            styles.workerMetaRow
                                        }
                                    >
                                        <Text
                                            style={
                                                styles.workerMeta
                                            }
                                        >
                                            📱 {phone}
                                        </Text>
                                    </View>

                                    <View
                                        style={
                                            styles.workerMetaRow
                                        }
                                    >
                                        <Text
                                            style={
                                                styles.workerMeta
                                            }
                                        >
                                            🌐{" "}
                                            {language.toUpperCase()}
                                        </Text>

                                        <Text
                                            style={
                                                styles.workerMeta
                                            }
                                        >
                                            • {role}
                                        </Text>
                                    </View>
                                </View>

                                {/* STATUS */}

                                <View
                                    style={
                                        styles.workerRight
                                    }
                                >
                                    <View
                                        style={[
                                            styles.statusBadge,
                                            isActive
                                                ? styles.activeBadge
                                                : styles.inactiveBadge
                                        ]}
                                    >
                                        <View
                                            style={[
                                                styles.statusDot,
                                                isActive
                                                    ? styles.activeDot
                                                    : styles.inactiveDot
                                            ]}
                                        />

                                        <Text
                                            style={[
                                                styles.statusText,
                                                isActive
                                                    ? styles.activeText
                                                    : styles.inactiveText
                                            ]}
                                        >
                                            {isActive
                                                ? "Active"
                                                : "Inactive"}
                                        </Text>
                                    </View>

                                    <Text
                                        style={
                                            styles.workerArrow
                                        }
                                    >
                                        ›
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        );
                    })
                ) : (
                    <View style={styles.emptyCard}>
                        <Text style={styles.emptyIcon}>
                            👥
                        </Text>

                        <Text style={styles.emptyTitle}>
                            No workers found
                        </Text>

                        <Text style={styles.emptyText}>
                            No workers are currently available
                            for your assigned site.
                        </Text>
                    </View>
                )}

                {/* FOOTER */}

                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        SIH26041 • Site Officer Workers
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}


/* =====================================================
   STYLES
===================================================== */

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background
    },

    content: {
        padding: SPACING.md,
        paddingBottom: SPACING.xl * 2
    },

    loadingContainer: {
        flex: 1,
        backgroundColor: COLORS.background,
        justifyContent: "center",
        alignItems: "center"
    },

    loadingText: {
        color: COLORS.textSecondary,
        marginTop: SPACING.md,
        fontSize: 14
    },

    /* HEADER */

    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: SPACING.lg
    },

    headerLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1
    },

    backButtonContainer: {
        width: 42,
        height: 42,
        borderRadius: RADIUS.md,
        backgroundColor: "rgba(255, 255, 255, 0.06)",
        borderWidth: 1,
        borderColor: COLORS.border,
        justifyContent: "center",
        alignItems: "center",
        marginRight: SPACING.sm
    },

    backButton: {
        color: COLORS.white,
        fontSize: 32,
        lineHeight: 34,
        fontWeight: "300",
        marginTop: -3
    },

    headerTextContainer: {
        flex: 1
    },

    title: {
        color: COLORS.white,
        fontSize: 28,
        fontWeight: "800"
    },

    subtitle: {
        color: COLORS.textSecondary,
        fontSize: 13,
        marginTop: 4
    },

    countBadge: {
        minWidth: 42,
        height: 42,
        borderRadius: RADIUS.md,
        backgroundColor: "rgba(255, 215, 0, 0.10)",
        borderWidth: 1,
        borderColor: "rgba(255, 215, 0, 0.35)",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 8
    },

    countText: {
        color: COLORS.secondary,
        fontSize: 17,
        fontWeight: "800"
    },

    /* ERROR */

    errorCard: {
        backgroundColor: "rgba(239, 68, 68, 0.10)",
        borderWidth: 1,
        borderColor: "rgba(239, 68, 68, 0.35)",
        borderRadius: RADIUS.lg,
        padding: SPACING.md,
        marginBottom: SPACING.md
    },

    errorTitle: {
        color: COLORS.danger,
        fontSize: 15,
        fontWeight: "800"
    },

    errorText: {
        color: COLORS.textSecondary,
        fontSize: 12,
        lineHeight: 18,
        marginTop: 5
    },

    retryButton: {
        alignSelf: "flex-start",
        marginTop: SPACING.sm,
        backgroundColor: COLORS.danger,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderRadius: RADIUS.md
    },

    retryText: {
        color: COLORS.white,
        fontSize: 13,
        fontWeight: "700"
    },

    /* SUMMARY */

    summaryCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: RADIUS.lg,
        padding: SPACING.md
    },

    summaryIcon: {
        width: 48,
        height: 48,
        borderRadius: RADIUS.md,
        backgroundColor: "rgba(255, 215, 0, 0.10)",
        justifyContent: "center",
        alignItems: "center",
        marginRight: SPACING.md
    },

    summaryIconText: {
        fontSize: 22
    },

    summaryContent: {
        flex: 1
    },

    summaryTitle: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: "800"
    },

    summaryText: {
        color: COLORS.textSecondary,
        fontSize: 12,
        lineHeight: 18,
        marginTop: 3
    },

    /* SECTION */

    sectionTitle: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: "800",
        marginTop: SPACING.lg,
        marginBottom: SPACING.sm
    },

    /* WORKER CARD */

    workerCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: RADIUS.lg,
        padding: SPACING.md,
        marginBottom: SPACING.sm
    },

    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "rgba(255, 215, 0, 0.14)",
        borderWidth: 1,
        borderColor: "rgba(255, 215, 0, 0.35)",
        justifyContent: "center",
        alignItems: "center",
        marginRight: SPACING.sm
    },

    avatarText: {
        color: COLORS.secondary,
        fontSize: 19,
        fontWeight: "800"
    },

    workerInfo: {
        flex: 1,
        minWidth: 0
    },

    workerName: {
        color: COLORS.white,
        fontSize: 15,
        fontWeight: "800"
    },

    workerEmail: {
        color: COLORS.textSecondary,
        fontSize: 11,
        marginTop: 3
    },

    workerMetaRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 5
    },

    workerMeta: {
        color: COLORS.textSecondary,
        fontSize: 10,
        marginRight: 7
    },

    workerRight: {
        alignItems: "flex-end",
        marginLeft: SPACING.sm
    },

    statusBadge: {
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 20,
        paddingHorizontal: 8,
        paddingVertical: 5
    },

    activeBadge: {
        backgroundColor: "rgba(34, 197, 94, 0.10)"
    },

    inactiveBadge: {
        backgroundColor: "rgba(239, 68, 68, 0.10)"
    },

    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 5
    },

    activeDot: {
        backgroundColor: COLORS.success
    },

    inactiveDot: {
        backgroundColor: COLORS.danger
    },

    statusText: {
        fontSize: 9,
        fontWeight: "800"
    },

    activeText: {
        color: COLORS.success
    },

    inactiveText: {
        color: COLORS.danger
    },

    workerArrow: {
        color: COLORS.secondary,
        fontSize: 25,
        fontWeight: "300",
        marginTop: 6
    },

    /* EMPTY */

    emptyCard: {
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: RADIUS.lg,
        padding: SPACING.xl,
        alignItems: "center"
    },

    emptyIcon: {
        fontSize: 32,
        marginBottom: SPACING.sm
    },

    emptyTitle: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: "800"
    },

    emptyText: {
        color: COLORS.textSecondary,
        fontSize: 12,
        textAlign: "center",
        lineHeight: 18,
        marginTop: 5
    },

    /* FOOTER */

    footer: {
        alignItems: "center",
        marginTop: SPACING.xl
    },

    footerText: {
        color: COLORS.textSecondary,
        fontSize: 11
    }
});

