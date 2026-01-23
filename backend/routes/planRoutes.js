import express from "express";
import { createPlan, updatePlan, getPlanByDate } from "../controllers/PlanController.js";

const router = express.Router();

router
    .route("/")
    .post(createPlan)
    .get(getPlanByDate);

router
    .route("/:id")
    .put(updatePlan);

export default router;