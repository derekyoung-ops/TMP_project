import express from "express";
import {
    createEquipment,
    getAllEquipment,
    getEquipmentById,
    updateEquipment,
    deleteEquipment
} from "../controllers/equipmentController.js";

const router = express.Router();

router.post("/", createEquipment);          // Create
router.get("/", getAllEquipment);            // Read all
router.get("/:id", getEquipmentById);        // Read one
router.put("/:id", updateEquipment);         // Update
router.delete("/:id", deleteEquipment);      // Soft delete

export default router;
