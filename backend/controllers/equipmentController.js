import Equipment from "../models/equipmentModel.js";

/**
 * CREATE equipment
 */
export const createEquipment = async (req, res) => {
    try {
        const equipment = await Equipment.create(req.body);
        res.status(201).json({
            success: true,
            data: equipment
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * READ all equipment (not deleted)
 */
export const getAllEquipment = async (req, res) => {
    try {
        const equipment = await Equipment.find({ del_flag: false })
            .populate("user", "name email");

        res.status(200).json({
            success: true,
            data: equipment
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * READ single equipment by ID
 */
export const getEquipmentById = async (req, res) => {
    try {
        const equipment = await Equipment.findById(req.params.id);

        if (!equipment || equipment.del_flag) {
            return res.status(404).json({
                success: false,
                message: "Equipment not found"
            });
        }

        res.status(200).json({
            success: true,
            data: equipment
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * UPDATE equipment
 */
export const updateEquipment = async (req, res) => {
    try {
        const equipment = await Equipment.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!equipment) {
            return res.status(404).json({
                success: false,
                message: "Equipment not found"
            });
        }

        res.status(200).json({
            success: true,
            data: equipment
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * DELETE equipment (soft delete)
 */
export const deleteEquipment = async (req, res) => {
    try {
        const equipment = await Equipment.findByIdAndUpdate(
            req.params.id,
            { del_flag: true },
            { new: true }
        );

        if (!equipment) {
            return res.status(404).json({
                success: false,
                message: "Equipment not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Equipment deleted successfully"
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};
