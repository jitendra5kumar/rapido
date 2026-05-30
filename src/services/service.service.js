import Service from "../models/service.model.js";
import { uploadToImgBB } from "../services/imgbb.service.js";

const slugify = (text) => {
    return text
        .toString()
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
};

// ➤ Create Service
export const createServiceService = async (data) => {
    let { name, slug, description, image } = data;

    if (!name || !name.trim()) {
        throw new Error("Name is required to generate slug");
    }

    slug = slug && typeof slug === "string" && slug.trim()
        ? slugify(slug)
        : slugify(name);

    // ✅ Upload image if buffer/file provided
    if (image && typeof image !== "string") {
        image = await uploadToImgBB(image);
    }

    const service = await Service.create({
        name,
        slug,
        description,
        image,
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
    let { image, name, slug } = data;

    if (name && (!slug || typeof slug !== "string" || !slug.trim())) {
        data.slug = slugify(name);
    } else if (slug && typeof slug === "string") {
        data.slug = slugify(slug);
    }

    // ✅ upload if new file comes
    if (image && typeof image !== "string") {
        image = await uploadToImgBB(image);
        data.image = image;
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