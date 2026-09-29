import NetInfo from "@react-native-community/netinfo";

export const getNetworkStatus = async () => {
    const state = await NetInfo.fetch();

    return {
        isConnected: state.isConnected === true,
        isInternetReachable: state.isInternetReachable !== false,
        type: state.type
    };
};

export const isOnline = async () => {
    const status = await getNetworkStatus();

    return (
        status.isConnected &&
        status.isInternetReachable
    );
};

export const subscribeToNetworkChanges = (callback) => {
    return NetInfo.addEventListener((state) => {
        callback({
            isConnected: state.isConnected === true,
            isInternetReachable:
                state.isInternetReachable !== false,
            type: state.type
        });
    });
};