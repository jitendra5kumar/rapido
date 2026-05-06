import crypto from "crypto";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// 🎯 referral code generator
const generateReferralCode = () => {
    return crypto.randomBytes(4).toString("hex").toUpperCase();
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

    await otpCache.deleteOtp(phone);
    await otpCache.deleteData(phone);

    let user = await User.findOne({ phone });

    if (!user) {
        const hashedPassword = await bcrypt.hash(userData.password, 10);

        // 🔥 unique referral code generate
        let referral_code;
        let isUnique = false;

        while (!isUnique) {
            referral_code = generateReferralCode();
            const exists = await User.findOne({ referral_code });
            if (!exists) isUnique = true;
        }

        user = await User.create({
            name: userData.name,
            phone,
            password: hashedPassword,
            email: userData.email || null,
            role: "driver",
            referral_code, // ✅ added here
        });
    }

    const token = jwt.sign(
        { id: user._id, phone: user.phone, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );

    return {
        token,
        user: {
            id: user._id,
            name: user.name,
            phone: user.phone,
            role: user.role,
            referral_code: user.referral_code, // optional but useful
        },
    };
};

export const createDriverService = async (payload) => {
    const { name, phone, password, email } = payload;

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

    const driver = await User.create({
        name,
        phone,
        email,
        password: hashedPassword,
        role: "driver",
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

    if (!/^[6-9]\d{9}$/.test(phone)) {
        throw new Error("Invalid phone number");
    }

    const existingOtp = await otpCache.getOtp(phone);
    if (existingOtp) {
        throw new Error("OTP already sent. Please wait 60 seconds");
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await otpCache.setOtp(phone, otp, 60);

    await otpCache.setData(
        phone,
        { name, password, email },
        300
    );

    console.log(`OTP for ${phone}: ${otp}`);

    return {
        message: "OTP sent successfully",
        phone,
    };
};


