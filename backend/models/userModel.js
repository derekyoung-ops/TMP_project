import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    avatar: {
        type: String,
        default: ""
    },
    birthday: {
        type: Date,
        required: true, 
    },
    gender: {
        type: String,
        enum: ["male", "female"],
        default: "",
    },
    group: {
        type: Schema.Types.ObjectId,
        ref: "Group",
    },
    role: {
        type: String,
        enum: ["admin", "mananger", "member"],
        default: "member",
    },
    password: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;