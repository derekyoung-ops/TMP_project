import mongoose, { Schema } from "mongoose";

const equipmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    brand: {
        type: String,
        required: true,
    },
    property: {
        type: String,
        required: true
    },
    number: {
        type: String,
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    status: {
        type: String,
    }
}, {
    timestamps: true
});

const Equipment = mongoose.model("Equipment", equipmentSchema);

export default Equipment;