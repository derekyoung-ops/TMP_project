import mongoose, { Schema } from "mongoose";

const GroupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    manager: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    del_flag: {
        type: Boolean,
        default: false,
    }
}, {
    timestamps: true
});

const Group = mongoose.model("Group", GroupSchema);

export default Group;