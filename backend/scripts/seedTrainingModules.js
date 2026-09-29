const dotenv = require("dotenv");
const mongoose = require("mongoose");

const connectDB = require("../src/config/db");
const TrainingModule = require("../src/models/TrainingModule");

dotenv.config();

const trainingModules = [
    {
        moduleId: "fire_emergency",

        title: "Fire & Explosion Emergency",

        description:
            "Practice identifying a fire hazard, raising the alarm, avoiding the danger zone, evacuating safely, and extinguishing a small fire.",

        passingScore: 70,

        version: 1,

        isActive: true,

        steps: [
            {
                stepId: "identify_hazard",
                type: "identify",
                instructionKey:
                    "fire_emergency_identify_hazard_instruction",
                correctAction: "tap_fire",
                incorrectActions: [],
                points: 10,
                critical: false,
                feedbackCorrectKey:
                    "fire_emergency_identify_hazard_feedback_correct",
                feedbackIncorrectKey:
                    "fire_emergency_identify_hazard_feedback_incorrect",
                hintKey:
                    "fire_emergency_identify_hazard_hint",
                timeLimitSeconds: 30
            },

            {
                stepId: "raise_alarm",
                type: "interact",
                instructionKey:
                    "fire_emergency_raise_alarm_instruction",
                correctAction: "activate_alarm",
                incorrectActions: [],
                points: 15,
                critical: false,
                feedbackCorrectKey:
                    "fire_emergency_raise_alarm_feedback_correct",
                feedbackIncorrectKey:
                    "fire_emergency_raise_alarm_feedback_incorrect",
                hintKey:
                    "fire_emergency_raise_alarm_hint",
                timeLimitSeconds: 25
            },

            {
                stepId: "avoid_hazard_zone",
                type: "avoid",
                instructionKey:
                    "fire_emergency_avoid_hazard_zone_instruction",
                correctAction: "",
                incorrectActions: [
                    "enter_hazard_zone"
                ],
                points: 20,
                critical: true,
                feedbackCorrectKey:
                    "fire_emergency_avoid_hazard_zone_feedback_correct",
                feedbackIncorrectKey:
                    "fire_emergency_avoid_hazard_zone_feedback_incorrect",
                hintKey:
                    "fire_emergency_avoid_hazard_zone_hint",
                timeLimitSeconds: 8
            },

            {
                stepId: "find_exit",
                type: "navigate",
                instructionKey:
                    "fire_emergency_find_exit_instruction",
                correctAction: "reach_exit_point",
                incorrectActions: [],
                points: 15,
                critical: false,
                feedbackCorrectKey:
                    "fire_emergency_find_exit_feedback_correct",
                feedbackIncorrectKey:
                    "fire_emergency_find_exit_feedback_incorrect",
                hintKey:
                    "fire_emergency_find_exit_hint",
                timeLimitSeconds: 30
            },

            {
                stepId: "select_extinguisher",
                type: "select",
                instructionKey:
                    "fire_emergency_select_extinguisher_instruction",
                correctAction:
                    "select_co2_extinguisher",
                incorrectActions: [
                    "select_water_extinguisher",
                    "select_foam_extinguisher"
                ],
                points: 20,
                critical: false,
                feedbackCorrectKey:
                    "fire_emergency_select_extinguisher_feedback_correct",
                feedbackIncorrectKey:
                    "fire_emergency_select_extinguisher_feedback_incorrect",
                hintKey:
                    "fire_emergency_select_extinguisher_hint",
                timeLimitSeconds: 25
            },

            {
                stepId: "extinguish_fire",
                type: "interact",
                instructionKey:
                    "fire_emergency_extinguish_fire_instruction",
                correctAction:
                    "use_extinguisher_on_fire",
                incorrectActions: [],
                points: 20,
                critical: false,
                feedbackCorrectKey:
                    "fire_emergency_extinguish_fire_feedback_correct",
                feedbackIncorrectKey:
                    "fire_emergency_extinguish_fire_feedback_incorrect",
                hintKey:
                    "fire_emergency_extinguish_fire_hint",
                timeLimitSeconds: 25
            }
        ]
    },

    {
        moduleId: "gas_leak_confined_space",

        title: "Gas Leak & Confined Space Safety",

        description:
            "Practice identifying a gas leak, maintaining a safe distance, selecting PPE, confirming the buddy system, following emergency procedures, and evacuating safely.",

        passingScore: 70,

        version: 1,

        isActive: true,

        steps: [
            {
                stepId: "identify_leak",
                type: "identify",
                instructionKey:
                    "gas_leak_confined_space_identify_leak_instruction",
                correctAction:
                    "identify_gas_leak",
                incorrectActions: [],
                points: 10,
                critical: false,
                feedbackCorrectKey:
                    "gas_leak_confined_space_identify_leak_feedback_correct",
                feedbackIncorrectKey:
                    "gas_leak_confined_space_identify_leak_feedback_incorrect",
                hintKey:
                    "gas_leak_confined_space_identify_leak_hint",
                timeLimitSeconds: 30
            },

            {
                stepId: "maintain_safe_distance",
                type: "avoid",
                instructionKey:
                    "gas_leak_confined_space_maintain_safe_distance_instruction",
                correctAction: "",
                incorrectActions: [
                    "enter_gas_hazard_zone"
                ],
                points: 20,
                critical: true,
                feedbackCorrectKey:
                    "gas_leak_confined_space_maintain_safe_distance_feedback_correct",
                feedbackIncorrectKey:
                    "gas_leak_confined_space_maintain_safe_distance_feedback_incorrect",
                hintKey:
                    "gas_leak_confined_space_maintain_safe_distance_hint",
                timeLimitSeconds: 10
            },

            {
                stepId: "select_ppe",
                type: "select",
                instructionKey:
                    "gas_leak_confined_space_select_ppe_instruction",
                correctAction:
                    "select_required_ppe",
                incorrectActions: [
                    "select_incomplete_ppe"
                ],
                points: 20,
                critical: false,
                feedbackCorrectKey:
                    "gas_leak_confined_space_select_ppe_feedback_correct",
                feedbackIncorrectKey:
                    "gas_leak_confined_space_select_ppe_feedback_incorrect",
                hintKey:
                    "gas_leak_confined_space_select_ppe_hint",
                timeLimitSeconds: 30
            },

            {
                stepId: "confirm_buddy_system",
                type: "interact",
                instructionKey:
                    "gas_leak_confined_space_confirm_buddy_system_instruction",
                correctAction:
                    "confirm_buddy_system",
                incorrectActions: [
                    "enter_confined_space_alone"
                ],
                points: 15,
                critical: true,
                feedbackCorrectKey:
                    "gas_leak_confined_space_confirm_buddy_system_feedback_correct",
                feedbackIncorrectKey:
                    "gas_leak_confined_space_confirm_buddy_system_feedback_incorrect",
                hintKey:
                    "gas_leak_confined_space_confirm_buddy_system_hint",
                timeLimitSeconds: 25
            },

            {
                stepId: "follow_emergency_procedure",
                type: "interact",
                instructionKey:
                    "gas_leak_confined_space_follow_emergency_procedure_instruction",
                correctAction:
                    "follow_emergency_procedure",
                incorrectActions: [
                    "enter_confined_space"
                ],
                points: 15,
                critical: true,
                feedbackCorrectKey:
                    "gas_leak_confined_space_follow_emergency_procedure_feedback_correct",
                feedbackIncorrectKey:
                    "gas_leak_confined_space_follow_emergency_procedure_feedback_incorrect",
                hintKey:
                    "gas_leak_confined_space_follow_emergency_procedure_hint",
                timeLimitSeconds: 30
            },

            {
                stepId: "evacuate_to_assembly_point",
                type: "navigate",
                instructionKey:
                    "gas_leak_confined_space_evacuate_to_assembly_point_instruction",
                correctAction:
                    "reach_assembly_point",
                incorrectActions: [],
                points: 20,
                critical: false,
                feedbackCorrectKey:
                    "gas_leak_confined_space_evacuate_to_assembly_point_feedback_correct",
                feedbackIncorrectKey:
                    "gas_leak_confined_space_evacuate_to_assembly_point_feedback_incorrect",
                hintKey:
                    "gas_leak_confined_space_evacuate_to_assembly_point_hint",
                timeLimitSeconds: 30
            }
        ]
    }
];

const seedTrainingModules = async () => {
    try {
        await connectDB();

        await TrainingModule.deleteMany({});

        await TrainingModule.insertMany(trainingModules);

        console.log("Training modules seeded successfully.");
        console.log(`Inserted modules: ${trainingModules.length}`);

        for (const module of trainingModules) {
            console.log(
                `- ${module.moduleId}: ${module.steps.length} steps`
            );
        }

        await mongoose.connection.close();

        process.exit(0);
    } catch (error) {
        console.error("Training module seeding failed:", error);

        await mongoose.connection.close();

        process.exit(1);
    }
};

seedTrainingModules();