const { Router } = require("express");

const router = Router();

router.use("/auth", require("./authRoutes"));
router.use("/user", require("./userRoutes"));
router.use("/upload", require("./uploadRoutes"));

module.exports = router;
