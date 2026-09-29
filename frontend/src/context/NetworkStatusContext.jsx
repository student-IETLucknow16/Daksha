import React, {
    createContext,
    useContext,
    useEffect,
    useState
} from "react";

import {
    getNetworkStatus,
    subscribeToNetworkChanges
} from "../services/networkService";

const NetworkStatusContext = createContext(null);

export const NetworkStatusProvider = ({ children }) => {
    const [network, setNetwork] = useState({
        isConnected: true,
        isInternetReachable: true,
        type: "unknown"
    });

    useEffect(() => {
        let mounted = true;

        const initializeNetwork = async () => {
            const status = await getNetworkStatus();

            if (mounted) {
                setNetwork(status);
            }
        };

        initializeNetwork();

        const unsubscribe =
            subscribeToNetworkChanges((status) => {
                if (mounted) {
                    setNetwork(status);
                }
            });

        return () => {
            mounted = false;
            unsubscribe();
        };
    }, []);

    const isOnline =
        network.isConnected &&
        network.isInternetReachable;

    return (
        <NetworkStatusContext.Provider
            value={{
                ...network,
                isOnline
            }}
        >
            {children}
        </NetworkStatusContext.Provider>
    );
};

export const useNetworkStatus = () => {
    const context = useContext(NetworkStatusContext);

    if (!context) {
        throw new Error(
            "useNetworkStatus must be used inside NetworkStatusProvider"
        );
    }

    return context;
};