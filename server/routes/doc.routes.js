import express from "express";
import { upload } from "../helper/multer.js";
import DocModel from "../model/Doc.js";
import mongoose from "mongoose";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.post(
  "/",
  verifyToken,
  upload.fields([
    {
      name: "doc",
      maxCount: 1,
    },
  ]),
  async (req, res) => {
    try {
      console.log(req.user.id);
      const newDoc = new DocModel({
        coordinates: req.body.coordinates,
        docUrl: req.docUrl,
        doc: req.doc,
        receiverEmail: req.body.email,
        senderId: new mongoose.Types.ObjectId(req.user.id),
      });
      await newDoc.save({ validateBeforeSave: true });
      res.status(200).json({ data: newDoc, message: "Document sent." });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ message: "Somthing went wrong." });
    }
  }
);

router.get("/reviewDocs", verifyToken, async (req, res) => {
  try {
    const docs = await DocModel.find({ senderId: req.user.id });
    console.log(docs);
    res.status(200).json({ message: "Found docs", data: docs });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Somthing went wrong." });
  }
});

export default router;
