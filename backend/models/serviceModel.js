import mongoose, { Schema } from "mongoose";

const serviceSchema = new mongoose.Schema({
    serve_name: {
        type: String,
        required: true,
    },
    due_date : {
        type: Date,
    },
    serve_unit: {
        type: Schema.Types.ObjectId,
        ref: 'Group'
    },
    serve_member: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    serve_account: {
        type: Schema.Types.ObjectId,
        ref: 'Account'
    },
    del_flag: {
        type: Boolean,
        default: false,
        index: true,
    } 
}, {
    timestamps: true
});

const Service = mongoose.model("Service", serviceSchema);

export default Service;