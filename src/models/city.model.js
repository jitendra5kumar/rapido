import mongoose from 'mongoose';

const citySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true, // duplicate city avoid karega
    },

    image: {
      type: String, 
      required: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // jis user ne city create ki
      required: true,
    },
  },
  {
    timestamps: true, // createdAt & updatedAt auto
  }
);

export default mongoose.model('City', citySchema);