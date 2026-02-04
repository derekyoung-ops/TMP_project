import express from "express";
import { createPlanExecution, updatePlanExecution, getPlanExecutionByDate, getGroupExecution, getExecutionPercentage } from "../controllers/executionController.js";

const router = express.Router();

router
    .route("/")
    .post(createPlanExecution)
    .get(getPlanExecutionByDate);

router
    .route("/:id")
    .put(updatePlanExecution);
router.get('/group', getGroupExecution);
router.get('/percentages', getExecutionPercentage);

export default router;