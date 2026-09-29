const TrainingModule = require("../models/TrainingModule");

const getTrainingModules = async (req, res) => {
    try {
        const modules = await TrainingModule.find({
            isActive: true
        }).select(
            "moduleId title description passingScore version"
        );

        res.json({
            success: true,
            count: modules.length,
            modules
        });
    } catch (error) {
        console.error("Get training modules error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while fetching training modules"
        });
    }
};

const getTrainingModule = async (req, res) => {
    try {
        const { moduleId } = req.params;

        const module = await TrainingModule.findOne({
            moduleId,
            isActive: true
        });

        if (!module) {
            return res.status(404).json({
                success: false,
                message: "Training module not found"
            });
        }

        res.json({
            success: true,
            module
        });
    } catch (error) {
        console.error("Get training module error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while fetching training module"
        });
    }
};

module.exports = {
    getTrainingModules,
    getTrainingModule
};