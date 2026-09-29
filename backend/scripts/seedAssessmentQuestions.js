const mongoose = require("mongoose");
require("dotenv").config();

const AssessmentQuestion = require("../src/models/AssessmentQuestion");

const questions = [
    // ==========================================
    // FIRE EMERGENCY
    // ==========================================

    {
        questionId: "fire_q1",
        moduleId: "fire_emergency",
        questionKey: "fire_emergency_quiz_q1_question",
        options: [
            "fire_emergency_quiz_q1_option0",
            "fire_emergency_quiz_q1_option1",
            "fire_emergency_quiz_q1_option2",
            "fire_emergency_quiz_q1_option3"
        ],
        correctOptionIndex: 1,
        safetyWeight: 1,
        isActive: true
    },

    {
        questionId: "fire_q2",
        moduleId: "fire_emergency",
        questionKey: "fire_emergency_quiz_q2_question",
        options: [
            "fire_emergency_quiz_q2_option0",
            "fire_emergency_quiz_q2_option1",
            "fire_emergency_quiz_q2_option2",
            "fire_emergency_quiz_q2_option3"
        ],
        correctOptionIndex: 1,
        safetyWeight: 1,
        isActive: true
    },

    {
        questionId: "fire_q3",
        moduleId: "fire_emergency",
        questionKey: "fire_emergency_quiz_q3_question",
        options: [
            "fire_emergency_quiz_q3_option0",
            "fire_emergency_quiz_q3_option1",
            "fire_emergency_quiz_q3_option2",
            "fire_emergency_quiz_q3_option3"
        ],
        correctOptionIndex: 2,
        safetyWeight: 1,
        isActive: true
    },

    {
        questionId: "fire_q4",
        moduleId: "fire_emergency",
        questionKey: "fire_emergency_quiz_q4_question",
        options: [
            "fire_emergency_quiz_q4_option0",
            "fire_emergency_quiz_q4_option1",
            "fire_emergency_quiz_q4_option2",
            "fire_emergency_quiz_q4_option3"
        ],
        correctOptionIndex: 1,
        safetyWeight: 1,
        isActive: true
    },

    {
        questionId: "fire_q5",
        moduleId: "fire_emergency",
        questionKey: "fire_emergency_quiz_q5_question",
        options: [
            "fire_emergency_quiz_q5_option0",
            "fire_emergency_quiz_q5_option1",
            "fire_emergency_quiz_q5_option2",
            "fire_emergency_quiz_q5_option3"
        ],
        correctOptionIndex: 2,
        safetyWeight: 1,
        isActive: true
    },

    // ==========================================
    // GAS LEAK / CONFINED SPACE
    // ==========================================

    {
        questionId: "gas_q1",
        moduleId: "gas_leak_confined_space",
        questionKey:
            "gas_leak_confined_space_quiz_q1_question",
        options: [
            "gas_leak_confined_space_quiz_q1_option0",
            "gas_leak_confined_space_quiz_q1_option1",
            "gas_leak_confined_space_quiz_q1_option2",
            "gas_leak_confined_space_quiz_q1_option3"
        ],
        correctOptionIndex: 1,
        safetyWeight: 1,
        isActive: true
    },

    {
        questionId: "gas_q2",
        moduleId: "gas_leak_confined_space",
        questionKey:
            "gas_leak_confined_space_quiz_q2_question",
        options: [
            "gas_leak_confined_space_quiz_q2_option0",
            "gas_leak_confined_space_quiz_q2_option1",
            "gas_leak_confined_space_quiz_q2_option2",
            "gas_leak_confined_space_quiz_q2_option3"
        ],
        correctOptionIndex: 2,
        safetyWeight: 1,
        isActive: true
    },

    {
        questionId: "gas_q3",
        moduleId: "gas_leak_confined_space",
        questionKey:
            "gas_leak_confined_space_quiz_q3_question",
        options: [
            "gas_leak_confined_space_quiz_q3_option0",
            "gas_leak_confined_space_quiz_q3_option1",
            "gas_leak_confined_space_quiz_q3_option2",
            "gas_leak_confined_space_quiz_q3_option3"
        ],
        correctOptionIndex: 1,
        safetyWeight: 1,
        isActive: true
    },

    {
        questionId: "gas_q4",
        moduleId: "gas_leak_confined_space",
        questionKey:
            "gas_leak_confined_space_quiz_q4_question",
        options: [
            "gas_leak_confined_space_quiz_q4_option0",
            "gas_leak_confined_space_quiz_q4_option1",
            "gas_leak_confined_space_quiz_q4_option2",
            "gas_leak_confined_space_quiz_q4_option3"
        ],
        correctOptionIndex: 1,
        safetyWeight: 1,
        isActive: true
    },

    {
        questionId: "gas_q5",
        moduleId: "gas_leak_confined_space",
        questionKey:
            "gas_leak_confined_space_quiz_q5_question",
        options: [
            "gas_leak_confined_space_quiz_q5_option0",
            "gas_leak_confined_space_quiz_q5_option1",
            "gas_leak_confined_space_quiz_q5_option2",
            "gas_leak_confined_space_quiz_q5_option3"
        ],
        correctOptionIndex: 1,
        safetyWeight: 1,
        isActive: true
    }
];

const seedAssessmentQuestions = async () => {
    try {
        await mongoose.connect(
            process.env.MONGODB_URI
        );

        console.log(
            "Connected to MongoDB."
        );

        await AssessmentQuestion.deleteMany({});

        console.log(
            "Cleared existing assessment questions."
        );

        const inserted =
            await AssessmentQuestion.insertMany(
                questions
            );

        console.log(
            `Inserted ${inserted.length} assessment questions.`
        );

        await mongoose.disconnect();

        console.log(
            "MongoDB connection closed."
        );

        process.exit(0);
    } catch (error) {
        console.error(
            "Assessment seed error:",
            error
        );

        await mongoose.disconnect();

        process.exit(1);
    }
};

seedAssessmentQuestions();