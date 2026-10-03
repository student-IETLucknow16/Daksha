import React, { useEffect } from "react";
import { Stack, useRouter } from "expo-router";
import * as Linking from "expo-linking";

import { AuthProvider } from "../context/AuthContext";
import { NetworkStatusProvider } from "../context/NetworkStatusContext";

export default function RootLayout() {
    const router = useRouter();

    useEffect(() => {
        const handleDeepLink = async (event) => {
            try {
                const url = event?.url;

                if (!url) {
                    return;
                }

                console.log(
                    "[DeepLink] Received:",
                    url
                );

                const parsed =
                    Linking.parse(url);

                console.log(
                    "[DeepLink] Parsed:",
                    parsed
                );

                const path =
                    parsed?.path;

                const params =
                    parsed?.queryParams || {};

                /*
                 * Certificate QR verification
                 *
                 * This deep link is still handled
                 * manually here.
                 */
                if (
                    path ===
                    "verify-certificate"
                ) {
                    const certificateId =
                        params.certificateId;

                    if (!certificateId) {
                        console.error(
                            "[CertificateQR] " +
                            "Certificate ID missing."
                        );

                        return;
                    }

                    router.push({
                        pathname:
                            "/verify-certificate",

                        params: {
                            certificateId:
                                String(
                                    certificateId
                                )
                        }
                    });

                    return;
                }

                /*
                 * Training results are NOT handled here.
                 *
                 * Expo Router will automatically
                 * open:
                 *
                 * /training-result
                 *
                 * and training-result.jsx will
                 * process the Unity result.
                 */
                if (
                    path ===
                    "training-result"
                ) {
                    console.log(
                        "[DeepLink] " +
                        "Training result received. " +
                        "Expo Router will handle /training-result."
                    );

                    return;
                }

                console.log(
                    "[DeepLink] " +
                    "Ignoring unrelated deep link."
                );
            } catch (error) {
                console.error(
                    "[DeepLink] Failed to process deep link:",
                    error?.response?.data ||
                    error
                );
            }
        };

        const subscription =
            Linking.addEventListener(
                "url",
                handleDeepLink
            );

        const checkInitialUrl =
            async () => {
                try {
                    const initialUrl =
                        await Linking.getInitialURL();

                    if (initialUrl) {
                        console.log(
                            "[DeepLink] Initial URL:",
                            initialUrl
                        );

                        await handleDeepLink({
                            url: initialUrl
                        });
                    }
                } catch (error) {
                    console.error(
                        "[DeepLink] Failed to get initial URL:",
                        error
                    );
                }
            };

        checkInitialUrl();

        return () => {
            subscription.remove();
        };
    }, [router]);

    return (
        <AuthProvider>
            <NetworkStatusProvider>
                <Stack
                    screenOptions={{
                        headerShown: false
                    }}
                />
            </NetworkStatusProvider>
        </AuthProvider>
    );
}


