import express from "express";
import { createPlanExecution, updatePlanExecution, getPlanExecutionByDate } from "../controllers/executionController.js";

const router = express.Router();

router
    .route("/")
    .post(createPlanExecution)
    .get(getPlanExecutionByDate);

router
    .route("/:id")
    .put(updatePlanExecution);

export default router;