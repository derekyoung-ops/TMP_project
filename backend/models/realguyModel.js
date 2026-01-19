import mongoose, { Schema } from "mongoose";

const realguySchema = new mongoose.Schema({
    name: { 
        type: String,
        required: true
    },
    nationality : {
        type: String,
        required: true,
    },
    gender : {
        type: String,
        required: true,
    },
    catcher : {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    when: {
        type: String,
        required: true
    },
    del_flag: {
        type: Boolean,
        default: false
    },
}, {
    timestamps: true
});

const Realguy = mongoose.model("Realguy", realguySchema);

export default Realguy;
