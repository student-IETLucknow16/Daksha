const express = require("express");

const {
    getTrainingModules,
    getTrainingModule
} = require("../controllers/trainingController");

const {
    protect
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getTrainingModules);

router.get("/:moduleId", protect, getTrainingModule);

module.exports = router;