import express from "express";
import {
    createRealguy,
    getRealguyList,
    getRealguyById,
    updateRealguy,
    deleteRealguy
} from "../controllers/RealguyController.js";

const router = express.Router();

router.route("/")
    .post(createRealguy)
    .get(getRealguyList);

router.route("/:id")
    .get(getRealguyById)
    .put(updateRealguy)
    .delete(deleteRealguy);

export default router;
