const express = require("express");

const {
    createCertification,
    verifyCertification
} = require("../controllers/certificationController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
    "/",
    protect,
    createCertification
);

router.get(
    "/verify/:certificateId",
    verifyCertification
);
module.exports = router;