import mongoose from "mongoose";

const statusEnum = ["pending", "approved", "rejected"];

const driverDocumentSchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        aadhaar: {
            front: {
                url: String,
                number: String,
                status: {
                    type: String,
                    enum: statusEnum,
                    default: "pending",
                },
            },
            back: {
                url: String,
                status: {
                    type: String,
                    enum: statusEnum,
                    default: "pending",
                },
            },
        },

        pan: {
            url: String,
            number: String,
            status: {
                type: String,
                enum: statusEnum,
                default: "pending",
            },
        },

        rc: {
            front: {
                url: String,
                number: String,
                status: {
                    type: String,
                    enum: statusEnum,
                    default: "pending",
                },
            },
            back: {
                url: String,
                status: {
                    type: String,
                    enum: statusEnum,
                    default: "pending",
                },
            },
        },

        dl: {
            front: {
                url: String,
                number: String,
                status: {
                    type: String,
                    enum: statusEnum,
                    default: "pending",
                },
            },
            back: {
                url: String,
                status: {
                    type: String,
                    enum: statusEnum,
                    default: "pending",
                },
            },
        },

        insurance: {
            url: String,
            policy_number: String,
            status: {
                type: String,
                enum: statusEnum,
                default: "pending",
            },
        },

        overall_status: {
            type: String,
            enum: ["pending", "under_review", "verified", "rejected"],
            default: "pending",
        },

        verified_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    {
        timestamps: true,
    }
);

driverDocumentSchema.pre("validate", async function (next) {
    try {
        const User = mongoose.model("User");

        const user = await User.findById(this.user_id);

        if (!user) {
            return next(new Error("User not found"));
        }

        if (user.role !== "driver") {
            return next(new Error("Only driver role users can upload documents"));
        }

        next();
    } catch (err) {
        next(err);
    }
});


export default mongoose.model("DriverDocument", driverDocumentSchema);