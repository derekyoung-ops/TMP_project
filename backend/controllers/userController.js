import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import generateToken from '../utils/generateToken.js';
import bcrypt from "bcryptjs";

// @desc   Get all users
// @route  GET /api/users
// @access Private (Admin or Authorized User)
const getUsers = asyncHandler(async (req, res) => {

    const users = await User.find({ del_flag: false })
        .select('-password'); // 🔒 never send passwords
    res.status(200).json(users);
});

const getGroupUsers = asyncHandler(async (req, res) => {
    const managerId = req.params.id;
    const members = await User.find({ group: managerId }).select("_id name");
    res.status(200).json(members)
})

// @desc  Auth user/set token
// route POST /api/users/auth
// @access Public
const authUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email, del_flag: false });

    if (user && (await user.matchPassword(password))) {
        generateToken(res, user._id);
        res.status(200).json(user);
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
});


// @desc  Register a new user
// route POST /api/users/register
// @access Public
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, birthday, gender, group, role, hubstaff_id, password } = req.body;

    const userExists = await User.findOne({ name, del_flag: false });


    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    const avatarPath = req.file
        ? `/uploads/avatars/${req.file.filename}`
        : null;

    const user = await User.create({
        name,
        email,
        birthday,
        gender,
        group: group || null,
        role,
        hubstaff_id,
        password,
        avatar: avatarPath,
    });

    if (user) {
        generateToken(res, user._id);
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            birthday: user.birthday,
            gender: user.gender,
            hubstaff_id: user.hubstaff_id,
            group: user.group,
            role: user.role,
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc  Logout user
// route POST /api/users/logout
// @access Public
const logoutUser = asyncHandler(async (req, res) => {
    res.cookie('token', '', {
        httpOnly: true,
        expires: new Date(0)
    });

    res.status(200).json({ message: 'User logged out successfully' });
});

// @desc  Get user profile
// route GET /api/users/profile
// @access Private
const getUserProfile = asyncHandler(async (req, res) => {
    if (!req.user) {
        res.status(404);
        throw new Error('User not found');
    }

    const user = {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
    }
    res.status(200).json(user);
});

// @desc  Update user profile
// route PUT /api/users/profile
// @access Private
const updateUserProfile = asyncHandler(async (req, res) => {
    if (!req.user) {
        res.status(401);
        throw new Error('Not authorized');
    }
    console.log(req.body);
    const user = await User.findById(req.body._id);
    console.log(user);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.birthday = req.body.birthday || user.birthday;
    user.gender = req.body.gender || user.gender;
    user.hubstaff_id = req.body.hubstaff_id || user.hubstaff_id;
    if ("group" in req.body) {
        if (!req.body.group || req.body.group === "") {
            user.group = null;
        } else {
            user.group = req.body.group;
        }
    }

    if (req.body.password) {
        user.password = req.body.password;
    }

    // Avatar update (same logic as registerUser)
    if (req.file) {
        user.avatar = `/uploads/avatars/${req.file.filename}`;
    }

    if (req.body.role === 'manager' && user.group) {
        const existingManager = await User.findOne({
            group: user.group,
            role: 'manager'
        });

        if (existingManager && existingManager._id.toString() !== user._id.toString()) {
            existingManager.role = "member";
            await existingManager.save();
        }
        user.role = "manager";
    } else if (req.body.role) {
        user.role = req.body.role;
    }

    const updatedUser = await user.save();

    res.status(200).json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
        birthday: updatedUser.birthday,
        gender: updatedUser.gender,
        hubstaff_id: updatedUser.hubstaff_id,
        group: updatedUser.group,
        role: updatedUser.role,
    });
});

const deleteUser = asyncHandler(async (req, res) => {

    const user = await User.findById(req.body._id);

    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    user.del_flag = true;
    await user.save();

    res.status(200).json({ message: "User deleted permanetly", member: req.body });


    //   await user.deleteOne();

    //   res.status(200).json({
    //     message: "User deleted permanently",
    //     userId: req.params.id,
    //   });
});

export const resetPasswordByEmail = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        res.status(400);
        throw new Error("Email is required");
    }

    const user = await User.findOne({ email });

    if (!user) {
        res.status(404);
        throw new Error("User with this email does not exist");
    }

    const defaultPassword = "1234567890";

    // ✅ set plain password
    user.password = defaultPassword;

    // ✅ pre-save hook hashes once
    await user.save();

    res.json({
        message: "Password has been reset successfully",
        defaultPassword, // ⚠️ remove in production
    });
});


export {
    getUsers,
    authUser,
    registerUser,
    logoutUser,
    getUserProfile,
    updateUserProfile,
    deleteUser,
    getGroupUsers
};