
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

export const sendOtp = async (phone, name, password, email = null) => {
    if (!phone) {
        throw new Error("Phone number is required");
    }

    // ✅ basic phone validation (India)
    if (!/^[6-9]\d{9}$/.test(phone)) {
        throw new Error("Invalid phone number");
    }

    // ✅ rate limit (1 min)
    const existingOtp = await otpCache.getOtp(phone);
    if (existingOtp) {
        throw new Error("OTP already sent. Please wait 60 seconds");
    }

    // ✅ Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // ✅ store OTP with expiry (60 sec)
    await otpCache.setOtp(phone, otp, 60);

    // ✅ store user data (temporary)
    await otpCache.setData(
        phone,
        { name, password, email },
        300 // 5 min expiry
    );

    // 🔥 For dev only
    console.log(`OTP for ${phone}: ${otp}`);

    // TODO: integrate SMS provider (MSG91, Twilio, Firebase)

    return {
        message: "OTP sent successfully",
        phone,
    };
};

export const verifyOtp = async (phone, otp) => {
    const storedOtp = await otpCache.getOtp(phone);

    if (!storedOtp || storedOtp !== otp) {
        throw new Error("Invalid or expired OTP");
    }

    const userData = await otpCache.getData(phone);

    if (!userData) {
        throw new Error("User data not found");
    }

    // cleanup
    await otpCache.deleteOtp(phone);
    await otpCache.deleteData(phone);

    let user = await User.findOne({ phone });

    // ✅ CASE 1: New user (register)
    if (!user) {
        const hashedPassword = await bcrypt.hash(userData.password, 10);

        user = await User.create({
            name: userData.name,
            phone,
            password: hashedPassword,
            role: "driver",
            location: {
                type: "Point",
                coordinates: [0, 0],
            },
        });
    }

    // ✅ CASE 2: Existing user (login)

    const token = jwt.sign(
        { id: user._id, phone: user.phone },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );

    return {
        token,
        user,
    };
};