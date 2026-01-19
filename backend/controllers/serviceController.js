import Service from "../models/serviceModel.js";

const cleanObjectId = (value) => {
  return value === "" || value === null ? undefined : value;
};

/**
 * @desc    Get all services
 * @route   GET /api/services
 */
export const getServices = async (req, res) => {
  const services = await Service.find({ del_flag: false })
    .populate("serve_unit", "name")
    .populate("serve_member", "name")
    .populate("serve_account", "account_type account_content.email")
    .sort({ createdAt: -1 });

  res.json(services);
};

/**
 * @desc    Create service
 * @route   POST /api/services
 */
export const createService = async (req, res) => {
  const {
    serve_name,
    due_date,
    serve_unit,
    serve_member,
    serve_account,
  } = req.body;

  const cleanedMember = cleanObjectId(serve_member);
  const cleanedUnit =
    cleanedMember ? undefined : cleanObjectId(serve_unit);

  const service = await Service.create({
    serve_name,
    due_date,
    serve_member: cleanedMember,
    serve_unit: cleanedUnit,
    serve_account: cleanObjectId(serve_account),
  });

  res.status(201).json(service);
};

/**
 * @desc    Update service
 * @route   PUT /api/services/:id
 */
export const updateService = async (req, res) => {
  const service = await Service.findById(req.params.id);

  if (!service) {
    res.status(404);
    throw new Error("Service not found");
  }

  const cleanedMember = cleanObjectId(req.body.serve_member);
  const cleanedUnit =
    cleanedMember ? undefined : cleanObjectId(req.body.serve_unit);

  service.serve_name = req.body.serve_name ?? service.serve_name;
  service.due_date = req.body.due_date ?? service.due_date;
  service.serve_member = cleanedMember;
  service.serve_unit = cleanedUnit;
  service.serve_account = cleanObjectId(req.body.serve_account);

  const updated = await service.save();
  res.json(updated);
};

/**
 * @desc    Soft delete service
 * @route   DELETE /api/services/:id
 */
export const deleteService = async (req, res) => {
  const service = await Service.findById(req.params.id);

  if (!service) {
    res.status(404);
    throw new Error("Service not found");
  }

  service.del_flag = true;
  await service.save();

  res.json({ message: "Service deleted" });
};
