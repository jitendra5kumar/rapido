import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
        },

        slug: {
            type: String,
            unique: true,
            index: true,
        },

        description: {
            type: String,
            default: "",
        },

        // ✅ USER UPLOADED FILES
        image: {
            type: String,
            default: "",
        },

        icon: {
            type: String, 
            default: "",
        },
    },
    {
        timestamps:true,
    }
);

export default mongoose.model("Service", serviceSchema);