import mongoose from "mongoose";

const { Schema } = mongoose;

const PdfSchema = new Schema({
  docId: { type: mongoose.Types.ObjectId, required: true },
  pdf: { type: String, required: true },
  pdfUrl: { type: String, required: true },
  coordinates: [
    {
      top: { type: String, required: true },
      left: { type: String, required: true },
      page: { type: String, required: true },
      type: { type: String, required: true },
    },
  ],
});

export default mongoose.model("Pdf", PdfSchema);
