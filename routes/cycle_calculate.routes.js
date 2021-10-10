const router = require("express").Router();

const {PerformanceReviewCycle} = require("../models/employee_scores.modal");
const {calcCycle} = require("../controllers/updateCollections");

router.get("/", calcCycle);

module.exports = router;
