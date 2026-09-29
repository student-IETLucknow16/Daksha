import * as Linking from "expo-linking";

export const launchUnityTraining = (moduleId, attemptId) => {
    const url =
        `sih26041://training` +
        `?moduleId=${encodeURIComponent(moduleId)}` +
        `&attemptId=${encodeURIComponent(attemptId)}`;

    console.log("Launching Unity with:", url);

    Linking.openURL(url);
};