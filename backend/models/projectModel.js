import mongoose, { Schema } from "mongoose";

const projectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    bidder: {
        type: Schema.Types.ObjectId,
        ref: "User",
        require: true
    },
    handler: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    customer_info: {
        type: Object,
        name: { type: String },
        nationality : { type: String },
        required: true,
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    startDate: {
        type: Date,
        required: true
    },
    DueDate : {
        type: Date,
        required: true,
    },
    note: {
        type: String,
    }
}, {
    timestamps: true
});

const Project = mongoose.model("Project", projectSchema);

export default Project;