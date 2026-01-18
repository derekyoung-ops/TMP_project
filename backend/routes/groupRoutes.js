import express from "express";
import {
  createGroup,
  getGroups,
  getGroupById,
  updateGroup,
  deleteGroup,
} from "../controllers/groupController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router
  .route("/")
    .post(protect, createGroup)
    .get(protect, getGroups);

router
  .route("/:id")
    .get(protect, getGroupById)
    .put(protect, updateGroup)
    .delete(protect, deleteGroup);

export default router;