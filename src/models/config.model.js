import mongoose from "mongoose";

const configSchema = new mongoose.Schema(
  {
    REDIS_URL: {
      type: String,
      default: "",
    },

    JWT_SECRET: {
      type: String,
      default: "",
    },

    FIREBASE_SERVICE_ACCOUNT: {
      type: String,
      default: "",
    },

    FIREBASE_PROJECT_ID: {
      type: String,
      default: "",
    },

    FIREBASE_CLIENT_EMAIL: {
      type: String,
      default: "",
    },

    FIREBASE_PRIVATE_KEY: {
      type: String,
      default: "",
    },

    FIREBASE_PRIVATE_KEY_ID: {
      type: String,
      default: "",
    },

    FIREBASE_CLIENT_ID: {
      type: String,
      default: "",
    },

    FIREBASE_AUTH_URI: {
      type: String,
      default: "",
    },

    FIREBASE_TOKEN_URI: {
      type: String,
      default: "",
    },

    FIREBASE_AUTH_PROVIDER_X509_CERT_URL: {
      type: String,
      default: "",
    },

    FIREBASE_CLIENT_X509_CERT_URL: {
      type: String,
      default: "",
    },

    IMGBB_API_KEY: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Config = mongoose.model("Config", configSchema);

export default Config;