import mongoose from "mongoose";

const { Schema } = mongoose;

const DocSchema = new Schema({
  doc: { type: String, required: true },
  docUrl: { type: String },
  coordinates: [
    {
      top: { type: String, required: true },
      left: { type: String, required: true },
      page: { type: String, required: true },
      type: { type: String, required: true },
    },
  ],
  senderId: {
    type: Schema.Types.ObjectId, // Correctly reference ObjectId type
    ref: "User",
  },
  receiverId: {
    type: Schema.Types.ObjectId, // Correctly reference ObjectId type
    ref: "User",
  },
  receiverEmail: {
    type: String,
    required: true,
  },
  status: { type: String, enum: ["pending"], default: "pending" },
});

export default mongoose.model("Doc", DocSchema);
