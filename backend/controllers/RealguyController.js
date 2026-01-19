import Realguy from "../models/realguyModel.js";

// CREATE
export const createRealguy = async (req, res) => {
    try {
        const realguy = await Realguy.create(req.body);
        res.status(201).json(realguy);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// READ ALL
export const getRealguyList = async (req, res) => {
    try {
        const realguys = await Realguy.find({ del_flag: false })
            .populate("user catcher");
        res.json(realguys);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// READ ONE
export const getRealguyById = async (req, res) => {
    try {
        const realguy = await Realguy.findById(req.params.id)
            .populate("user catcher");

        if (!realguy) {
            return res.status(404).json({ message: "Realguy not found" });
        }

        res.json(realguy);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// UPDATE
export const updateRealguy = async (req, res) => {
    try {
        const realguy = await Realguy.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!realguy) {
            return res.status(404).json({ message: "Realguy not found" });
        }

        res.json(realguy);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// DELETE (soft delete)
export const deleteRealguy = async (req, res) => {
    try {
        const realguy = await Realguy.findByIdAndUpdate(
            req.params.id,
            { del_flag: true },
            { new: true }
        );

        if (!realguy) {
            return res.status(404).json({ message: "Realguy not found" });
        }

        res.json({ message: "Realguy deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
