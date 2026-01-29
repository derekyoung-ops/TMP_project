import express from "express";
import { createPlan, updatePlan, getPlanByDate, getGroupPlanByDate } from "../controllers/PlanController.js";

const router = express.Router();

router
    .route("/")
    .post(createPlan)
    .get(getPlanByDate);

router
    .route("/:id")
    .put(updatePlan);
router.get('/group', getGroupPlanByDate)

export default router;