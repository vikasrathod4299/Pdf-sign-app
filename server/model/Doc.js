import mongoose from "mongoose";

const { Schema } = mongoose;

const DocSchema = new Schema({
  senderId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  receiverId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  receiverEmail: {
    type: String,
    required: true,
  },
  status: { type: String, enum: ["pending", "signed"], default: "pending" },
});

export default mongoose.model("Doc", DocSchema);
