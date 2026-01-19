import asyncHandler from "express-async-handler";
import Group from "../models/GroupModel.js";
import User from "../models/userModel.js";

/**
 * @desc    Create Group
 * @route   POST /api/groups
 * @access  Private (Admin)
 */
const createGroup = asyncHandler(async (req, res) => {

  const { name, description, manager, members = [] } = req.body;

  const groupExists = await Group.findOne({ name, del_flag: true });

  if (groupExists) {
    res.status(400);
    throw new Error("Group already exists");
  }

  const group = await Group.create({
    name,
    description,
    manager: manager || null,
    del_flag: true
  });

  if (manager) {
    await User.findByIdAndUpdate(manager, {
      group: group._id,
      role: "manager",
    });
  }

  if (members.length) {
    const filteredMembers = members.filter(
      (id) => id.toString() !== manager
    );

    if (filteredMembers.length) {
      await User.updateMany(
        { _id: { $in: filteredMembers } },
        {
          $set: {
            group: group._id,
            role: "member",
          },
        }
      );
    }
  }

  res.status(201).json(group);
});

/**
 * @desc    Get all Groups with Manager details
 * @route   GET /api/groups
 * @access  Private
 */
const getGroups = asyncHandler(async (req, res) => {
  const groups = await Group.find({ del_flag: false });

  const result = await Promise.all(
    groups.map(async (group) => {
      const manager = await User.findById(group.manager)
        .select("_id name email");

      // 🔥 GET ALL USERS IN THIS GROUP
      const members = await User.find({ group: group._id })
        .select("_id name email");

      return {
        _id: group._id,
        name: group.name,
        description: group.description,
        manager,
        members,
        memberCount: members.length,
        createdAt: group.createdAt,
        updatedAt: group.updatedAt,
      };
    })
  );

  res.status(200).json(result);
});

/**
 * @desc    Get Group by ID with Manager details
 * @route   GET /api/groups/:id
 * @access  Private
 */
const getGroupById = asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.id);

  if (!group || !group.del_flag) {
    res.status(404);
    throw new Error("Group not found");
  }

  const manager = await User.findById(group.manager)
    .select("_id name email");

  // 🔥 GET ALL USERS IN THIS GROUP
  const members = await User.find({ group: group._id })
    .select("_id name email");

  res.status(200).json({
    _id: group._id,
    name: group.name,
    description: group.description,
    manager,
    members,
    memberCount: members.length,
    createdAt: group.createdAt,
    updatedAt: group.updatedAt,
  });
});

/**
 * @desc    Update Group
 * @route   PUT /api/Groups/:id
 * @access  Private (Admin)
 */
const updateGroup = asyncHandler(async (req, res) => {
    if (!req.user || req.user.role !== "admin") {
      res.status(403);
      throw new Error("Not authorized");
    }

    const { name, description, manager, members = [] } = req.body.body;

    const group = await Group.findById(req.params.id);

    if (!group || !group.del_flag) {
      res.status(404);
      throw new Error("Group not found");
    }

    group.name = name || group.name;
    group.description = description || group.description;
    group.manager = manager || null;

    await group.save();

    /* ---------- ASSIGN MANAGER ---------- */
    if (manager) {
      await User.findByIdAndUpdate(manager, {
        group: group._id,
        role: "manager",
      });
    }

    /* ---------- ASSIGN MEMBERS ---------- */
    const filteredMembers = members.filter(
      (id) => id.toString() !== manager
    );

    if (filteredMembers.length) {
      await User.updateMany(
        { _id: { $in: filteredMembers } },
        {
          $set: {
            group: group._id,
            role: "member",
          },
        }
      );
  }

  /* ---------- RETURN UPDATED GROUP DATA ---------- */
  const updatedManager = manager
    ? await User.findById(manager).select("_id name email")
    : null;

  const updatedMembers = await User.find({ group: group._id }).select(
    "_id name email"
  );

  res.status(200).json({
    _id: group._id,
    name: group.name,
    description: group.description,
    manager: updatedManager,
    members: updatedMembers,
    memberCount: updatedMembers.length,
    updatedAt: group.updatedAt,
  });
});

/**
 * @desc    Soft Delete Group
 * @route   DELETE /api/groups/:id
 * @access  Private (Admin)
 */
const deleteGroup = asyncHandler(async (req, res) => {
  if (!req.user || req.user.role !== "admin") {
    res.status(403);
    throw new Error("Not authorized");
  }

  const group = await Group.findById(req.params.id);

  if (!group || !group.del_flag) {
    res.status(404);
    throw new Error("Group not found");
  }

  /* ---------- SOFT DELETE GROUP ---------- */
  group.del_flag = false;
  await group.save();

  /* ---------- RESET MANAGER (EXPLICIT) ---------- */
  if (group.manager) {
    await User.findByIdAndUpdate(group.manager, {
      $set: {
        group: null,
        role: "member",
      },
    });
  }

  /* ---------- RESET ALL MEMBERS ---------- */
  await User.updateMany(
    { group: group._id },
    {
      $set: {
        group: null,
        role: "member",
      },
    }
  );

  res.status(200).json({
    message: "Group deleted successfully",
    groupId: group._id,
  });
});

export {
  createGroup,
  getGroups,
  getGroupById,
  updateGroup,
  deleteGroup,
};