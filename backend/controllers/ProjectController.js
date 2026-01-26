import Project from "../models/projectModel.js";

/**
 * CREATE PROJECT
 */
export const createProject = async (req, res) => {
  try {
    const project = await Project.create({
      ...req.body,
      del_flag: false,
    });

    res.status(201).json(project);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * GET ALL PROJECTS (exclude deleted)
 */
export const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ del_flag: false })
      .populate("bidder handler account budget")
      .sort({ createdAt: -1 });

    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET SINGLE PROJECT
 */
export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      del_flag: false,
    }).populate("bidder handler account budget");

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * UPDATE PROJECT
 */
export const updateProject = async (req, res) => {
  try {
    const payload = req.body.data || req.body;

    const {
      title,
      handler,
      bidder,
      startDate,
      DueDate,
      site,
      note,
      client_info,
      budget,
    } = payload;

    const updateData = {
      title,
      handler,
      bidder,
      startDate,
      DueDate,
      site,
      note,
      client_info,
      budget,
    };

    Object.keys(updateData).forEach(
      (k) => updateData[k] === undefined && delete updateData[k]
    );

    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, del_flag: false },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.status(200).json(project);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


/**
 * SOFT DELETE PROJECT
 */
export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, del_flag: false },
      { del_flag: true },
      { new: true }
    );

    if (!project) {
      return res.status(404).json({ message: "Project not found or already deleted" });
    }

    res.status(200).json({ message: "Project deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const restoreProject = async (req, res) => {
  try {
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, del_flag: true },
      { del_flag: false },
      { new: true }
    );

    if (!project) {
      return res.status(404).json({ message: "Project not found or not deleted" });
    }

    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
