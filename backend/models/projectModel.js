import mongoose, { Schema } from "mongoose";

const projectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    bidder: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    handler: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    client_info: {
        type: Object,
        name: { type: String },
        nationality: { type: String },
        required: true,
    },
    account: {
        type: Schema.Types.ObjectId,
        ref: "Account",
    },
    site: {
        type: String,
    },
    startDate: {
        type: Date,
        required: true
    },
    DueDate: {
        type: Date,
    },
    budget: {
        method: {
            type: String,
            enum: ["hourly", "fixed"],
            default: "fixed",
        },
        amount: {
            type: Number,
            required: true,
        },
    },
    del_flag: {
        type: Boolean,
        default: false,
        index: true,
    }
}, {
    timestamps: true
});

const Project = mongoose.model("Project", projectSchema);

export default Project;