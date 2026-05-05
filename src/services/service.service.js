import Service from "../models/service.model.js";
import { uploadToImgBB } from "../services/imgbb.service.js";

// ➤ Create Service
export const createServiceService = async (data) => {
    let { name, slug, description, image, icon } = data;

    const existing = await Service.findOne({ slug });
    if (existing) {
        throw new Error("Slug already exists");
    }

    // ✅ Upload image if buffer/file provided
    if (image && typeof image !== "string") {
        image = await uploadToImgBB(image);
    }

    if (icon && typeof icon !== "string") {
        icon = await uploadToImgBB(icon);
    }

    const service = await Service.create({
        name,
        slug,
        description,
        image,
        icon,
    });

    return service;
};

// ➤ Get All
export const getAllServicesService = async () => {
    return await Service.find().sort({ createdAt: -1 });
};

// ➤ Get By ID
export const getServiceByIdService = async (id) => {
    const service = await Service.findById(id);
    if (!service) throw new Error("Service not found");
    return service;
};

// ➤ Update Service
export const updateServiceService = async (id, data) => {
    let { image, icon } = data;

    // ✅ upload if new file comes
    if (image && typeof image !== "string") {
        image = await uploadToImgBB(image);
        data.image = image;
    }

    if (icon && typeof icon !== "string") {
        icon = await uploadToImgBB(icon);
        data.icon = icon;
    }

    const service = await Service.findByIdAndUpdate(id, data, {
        new: true,
    });

    if (!service) throw new Error("Service not found");

    return service;
};

// ➤ Delete Service
export const deleteServiceService = async (id) => {
    const service = await Service.findByIdAndDelete(id);

    if (!service) throw new Error("Service not found");

    return true;
};