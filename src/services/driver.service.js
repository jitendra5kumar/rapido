import crypto from "crypto";
import User from "../models/user.model.js";
import DriverDocument from "../models/driverDocument.model.js";
import bcrypt from "bcryptjs";
import { jwt } from "../utils/index.js";
import otpCache from "../cache/otp.cache.js";
import sessionCache from "../cache/session.cache.js";

// 🎯 referral code generator
const generateReferralCode = () => {
    return crypto.randomBytes(4).toString("hex").toUpperCase();
};

// ==============================
// SEND OTP
// ==============================
export const sendOtp = async (
    phone,
    name,
    password,
    email = null,
    referral_code = null
) => {

    if (!phone) {
        throw new Error("Phone number is required");
    }

    // ✅ Indian mobile validation
    if (!/^[6-9]\d{9}$/.test(phone)) {
        throw new Error("Invalid phone number");
    }

    // ✅ existing user check
    const existingUser = await User.findOne({ phone });

    if (existingUser) {
        throw new Error("Phone already registered");
    }

    // ✅ OTP resend protection
    const existingOtp = await otpCache.getOtp(phone);

    if (existingOtp) {
        throw new Error("OTP already sent. Please wait 60 seconds");
    }

    // ✅ Sub admin referral code required
    if (!referral_code) {
        throw new Error("Sub admin referral code is required");
    }

    // ✅ Validate sub admin referral code
    const subAdmin = await User.findOne({
        referral_code,
        role: "sub_admin",
    });

    if (!subAdmin) {
        throw new Error("Invalid sub admin referral code");
    }

    // ✅ generate 4-digit otp
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    // ✅ save otp
    await otpCache.setOtp(phone, otp, 60);

    // ✅ save temporary data
    await otpCache.setData(
        phone,
        {
            name,
            password,
            email,
            referred_by_id: subAdmin._id,
        },
        300
    );

    console.log(`OTP for ${phone}: ${otp}`);

    return {
        success: true,
        message: "OTP sent successfully",
        phone,
    };
};

// ==============================
// VERIFY OTP
// ==============================
export const verifyOtp = async (phone, otp) => {

    const storedOtp = await otpCache.getOtp(phone);

    if (!storedOtp || storedOtp !== otp) {
        throw new Error("Invalid or expired OTP");
    }

    // ✅ get temp user data
    const userData = await otpCache.getData(phone);

    if (!userData) {
        throw new Error("User data not found");
    }

    // ✅ cleanup
    await otpCache.deleteOtp(phone);
    await otpCache.deleteData(phone);

    // ✅ check existing user
    let user = await User.findOne({ phone });

    if (!user) {

        const hashedPassword = await bcrypt.hash(
            userData.password,
            10
        );

        // ✅ unique referral code generation
        let referral_code;
        let isUnique = false;

        while (!isUnique) {

            referral_code = generateReferralCode();

            const exists = await User.findOne({
                referral_code,
            });

            if (!exists) {
                isUnique = true;
            }
        }

        // ✅ create driver
        user = await User.create({
            name: userData.name,
            phone,
            password: hashedPassword,
            email: userData.email || null,

            role: "driver",

            referral_code, // driver's own code

            referred_by_id: userData.referred_by_id, // linked sub admin
        });
    }

    // ✅ generate token
    const token = jwt.generateToken(
        {
            id: user._id,
            phone: user.phone,
            role: user.role,
        }
    );

    return {
        success: true,
        token,

        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            referral_code: user.referral_code,
            referred_by_id: user.referred_by_id,
        },
    };
};

// ==============================
// CREATE DRIVER DIRECTLY
// ==============================
export const createDriverService = async (payload) => {

    const {
        name,
        phone,
        password,
        email,
        referral_code,
    } = payload;

    // ✅ check existing
    const existing = await User.findOne({
        $or: [
            { phone },
            ...(email ? [{ email }] : []),
        ],
    });

    if (existing) {

        if (existing.phone === phone) {
            throw new Error("Phone already exists");
        }

        if (email && existing.email === email) {
            throw new Error("Email already exists");
        }
    }

    // ✅ validate sub admin code
    if (!referral_code) {
        throw new Error("Sub admin referral code is required");
    }

    const subAdmin = await User.findOne({
        referral_code,
        role: "sub_admin",
    });

    if (!subAdmin) {
        throw new Error("Invalid sub admin referral code");
    }

    // ✅ hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ generate unique driver referral code
    let driverReferralCode;
    let isUnique = false;

    while (!isUnique) {

        driverReferralCode = generateReferralCode();

        const exists = await User.findOne({
            referral_code: driverReferralCode,
        });

        if (!exists) {
            isUnique = true;
        }
    }

    // ✅ create driver
    const driver = await User.create({
        name,
        phone,
        email,
        password: hashedPassword,

        role: "driver",

        referral_code: driverReferralCode,

        referred_by_id: subAdmin._id,
    });

    return driver;
};

// ==============================
// LOGIN DRIVER
// ==============================
export const loginDriverService = async ({
    phone,
    password,
}) => {

    const user = await User.findOne({
        phone,
        role: "driver",
    });

    if (!user) {
        throw new Error("Invalid credentials");
    }

    const isMatch = await bcrypt.compare(
        password,
        user.password
    );

    if (!isMatch) {
        throw new Error("Wrong password");
    }

    const token = jwt.generateToken(
      {
        id: user._id,
        phone: user.phone,
        role: user.role,
      }
    );
   await sessionCache.setSession(user._id.toString(), token);
    return {
        user,
        token,
    };
};

// ==============================
// GET PROFILE
// ==============================
export const getProfileService = async (userId) => {
    const user = await User.findById(userId)
        .populate("profile_image_id")
        .populate("referred_by_id")
        .populate({
            path: "driver_id",
            populate: [
                { path: "serviceId" },
                { path: "vehicleTypeId" }
            ]
        });

    if (!user) {
        throw new Error("User not found");
    }

    const driverDoc = await DriverDocument.findOne({ user_id: userId });
    const userObj = user.toObject();
    
    // Check if driving license is uploaded
    const dlUploaded = Boolean(driverDoc?.dl?.front?.url && driverDoc?.dl?.back?.url);
    const profileSetupComplete = Boolean(user.name && user.gender && user.profile_image_id);
    const vehicleUploaded = Boolean(user.driver_id);
    const rcUploaded = Boolean(driverDoc?.rc?.front?.url && driverDoc?.rc?.front?.number);
    const aadhaarPanUploaded = Boolean(driverDoc?.aadhaar?.front?.url || driverDoc?.pan?.url);

    userObj.documents = {
      dlUploaded,
      profileSetupComplete,
      vehicleUploaded,
      rcUploaded,
      aadhaarPanUploaded,
      isVerified: Boolean(user.is_verified),
    };

    userObj.driverDocument = driverDoc;

    // Keep top-level compatibility
    userObj.isVerified = Boolean(user.is_verified);

    return userObj;
};

// ==============================
// UPDATE PROFILE
// ==============================
export const updateProfileService = async (
    userId,
    updates
) => {

    console.log(userId,updates)

    delete updates.password;
    delete updates.role;

    const user = await User.findByIdAndUpdate(
        userId,
        updates,
        {
            new: true,
        }
    );

    return user;
};

// ==============================
// LOGOUT
// ==============================
export const logoutService = async (userId) => {

    await User.findByIdAndUpdate(userId, {
        fcm_token: null,
        remember_token: null,
     
    });

    return true;
}