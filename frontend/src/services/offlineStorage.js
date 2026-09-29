import AsyncStorage from "@react-native-async-storage/async-storage";

const KEYS = {
    TRAINING_MODULES: "offline_training_modules",
    TRAINING_DATA_PREFIX: "offline_training_data_",
    ASSESSMENT_PREFIX: "offline_assessment_",
    PENDING_RESULTS: "offline_pending_results"
};

export const saveTrainingModules = async (modules) => {
    await AsyncStorage.setItem(
        KEYS.TRAINING_MODULES,
        JSON.stringify(modules)
    );
};

export const getCachedTrainingModules = async () => {
    const data = await AsyncStorage.getItem(
        KEYS.TRAINING_MODULES
    );

    return data ? JSON.parse(data) : null;
};

export const saveTrainingModule = async (
    moduleId,
    module
) => {
    await AsyncStorage.setItem(
        `${KEYS.TRAINING_DATA_PREFIX}${moduleId}`,
        JSON.stringify(module)
    );
};

export const getCachedTrainingModule = async (
    moduleId
) => {
    const data = await AsyncStorage.getItem(
        `${KEYS.TRAINING_DATA_PREFIX}${moduleId}`
    );

    return data ? JSON.parse(data) : null;
};

export const saveAssessmentQuestions = async (
    moduleId,
    questions
) => {
    await AsyncStorage.setItem(
        `${KEYS.ASSESSMENT_PREFIX}${moduleId}`,
        JSON.stringify(questions)
    );
};

export const getCachedAssessmentQuestions = async (
    moduleId
) => {
    const data = await AsyncStorage.getItem(
        `${KEYS.ASSESSMENT_PREFIX}${moduleId}`
    );

    return data ? JSON.parse(data) : null;
};

export const getPendingResults = async () => {
    const data = await AsyncStorage.getItem(
        KEYS.PENDING_RESULTS
    );

    return data ? JSON.parse(data) : [];
};

export const savePendingResults = async (results) => {
    await AsyncStorage.setItem(
        KEYS.PENDING_RESULTS,
        JSON.stringify(results)
    );
};

export const addPendingResult = async (result) => {
    const existing = await getPendingResults();

    existing.push({
        ...result,
        createdAt: new Date().toISOString()
    });

    await savePendingResults(existing);
};

export const clearPendingResults = async () => {
    await AsyncStorage.removeItem(
        KEYS.PENDING_RESULTS
    );
};