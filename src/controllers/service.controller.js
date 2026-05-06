import {
    createServiceService,
    getAllServicesService,
    getServiceByIdService,
    updateServiceService,
    deleteServiceService,
} from "../services/service.service.js";

// ➤ Create
export const createService = async (req, res) => {
    try {
        console.log("BODY:", req.body);
        console.log("FILES:", req.files);

        const data = {
            ...req.body,
            image: req.files?.image?.[0]?.buffer,
            icon: req.files?.icon?.[0]?.buffer,
        };

        const service = await createServiceService(data);

        return res.status(201).json({
            success: true,
            message: "Service created successfully",
            data: service,
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

// ➤ Get All
export const getAllServices = async (req, res) => {
    try {
        const services = await getAllServicesService();

        return res.status(200).json({
            success: true,
            data: services,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ➤ Get One
export const getServiceById = async (req, res) => {
    try {
        const service = await getServiceByIdService(req.params.id);

        return res.status(200).json({
            success: true,
            data: service,
        });
    } catch (error) {
        return res.status(404).json({
            success: false,
            message: error.message,
        });
    }
};

// ➤ Update
export const updateService = async (req, res) => {
    try {
        console.log("BODY:", req.body);
        console.log("FILES:", req.files);

        const data = {
            ...req.body,
        };

        // ✅ handle image
        if (req.files?.image) {
            data.image = req.files.image[0].buffer;
        }

        // ✅ handle icon
        if (req.files?.icon) {
            data.icon = req.files.icon[0].buffer;
        }

        const updated = await updateServiceService(req.params.id, data);

        return res.status(200).json({
            success: true,
            message: "Service updated successfully",
            data: updated,
        });
    } catch (error) {
        return res.status(404).json({
            success: false,
            message: error.message,
        });
    }
};

// ➤ Delete
export const deleteService = async (req, res) => {
    try {
        await deleteServiceService(req.params.id);

        return res.status(200).json({
            success: true,
            message: "Service deleted successfully",
        });
    } catch (error) {
        return res.status(404).json({
            success: false,
            message: error.message,
        });
    }
};