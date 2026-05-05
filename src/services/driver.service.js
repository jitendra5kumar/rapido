
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const createDriverService = async (payload) => {
    const { name, phone, password, email, location } = payload;

    const existing = await User.findOne({
        $or: [
            { phone },
            ...(email ? [{ email }] : [])
        ]
    });

    if (existing) {
        if (existing.phone === phone) {
            throw new Error("Phone already exists");
        }
        if (email && existing.email === email) {
            throw new Error("Email already exists");
        }
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Safe location handling
    let driverLocation = {
        type: "Point",
        coordinates: [0, 0], // default
    };

    if (
        location &&
        Array.isArray(location.coordinates) &&
        location.coordinates.length === 2
    ) {
        driverLocation = {
            type: "Point",
            coordinates: location.coordinates,
        };
    }

    const driver = await User.create({
        name,
        phone,
        email,
        password: hashedPassword,
        role: "driver",
        location: driverLocation, // ✅ FIXED
    });

    return driver;
};

export const loginDriverService = async ({ phone, password }) => {
    const user = await User.findOne({ phone, role: "driver" });
    if (!user) throw new Error("Invalid credentials");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Wrong password");

    const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );

    return { user, token };
};

export const getProfileService = async (userId) => {
    const user = await User.findById(userId)
        .populate("profile_image_id")
        .populate("service_id service_category_id");

    if (!user) throw new Error("User not found");

    return user;
};

export const updateProfileService = async (userId, updates) => {
    delete updates.password;
    delete updates.role;

    const user = await User.findByIdAndUpdate(userId, updates, {
        new: true,
    });

    return user;
};

export const logoutService = async (userId) => {
    await User.findByIdAndUpdate(userId, {
        fcm_token: null,
        remember_token: null,
        is_online: false,
    });

    return true;
};

// export const updateDriverService = async (userId, body) => {
//   // ✅ allowed fields (security)
//   const allowedFields = [
//     "name",
//     "email",
//     "gender",
//     "profile_image_id",
//     "service_id",
//     "service_category_id",
//     "aadhaar_number",
//     "pan_number",
//     "rc_number",
//     "dl_number",
//     "insurance_policy_number",
//     "fcm_token",
//     "is_online",
//     "location",
//   ];

//   const updates = {};

//   for (let key of allowedFields) {
//     if (body[key] !== undefined) {
//       updates[key] = body[key];
//     }
//   }

//   // ❌ block sensitive fields
//   delete updates.password;
//   delete updates.role;

//   const user = await User.findByIdAndUpdate(userId, updates, {
//     new: true,
//   });

//   if (!user) {
//     throw new Error("Driver not found");
//   }

//   return user;
// };