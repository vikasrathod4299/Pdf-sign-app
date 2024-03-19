/* eslint-disable no-undef */
import express from "express";
import { upload } from "../helper/multer.js";
import DocModel from "../model/Doc.js";
import mongoose from "mongoose";
import { verifyToken } from "../middleware/auth.js";
import { sendMail } from "../helper/sendMail.js";

const router = express.Router();

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const docData = await DocModel.findById(id).lean();
    if (docData) {
      return res
        .status(200)
        .json({ message: "Fetched document", data: docData });
    }
    return res.status(404).json({ message: "Document not found!" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Somthing went wrong" });
  }
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const updatedDoc = await DocModel.findByIdAndUpdate(id, { $set });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Somthing went wrong" });
  }
});

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
      const newDoc = new DocModel({
        coordinates: req.body.coordinates,
        docUrl: req.docUrl,
        doc: req.doc,
        receiverEmail: req.body.email,
        senderId: new mongoose.Types.ObjectId(req.user.id),
      });
      await newDoc.save({ validateBeforeSave: true });
      await sendMail({
        from: {
          name: "Miracle e-signature",
          address: process.env.USER,
        },
        to: [req.body.email],
        subject: "Sign you doucument.",
        text: "Hello world",
        html: `<a href=${process.env.CLIENT_URL}/signDocument/${newDoc._id}>Sign document.</a>`,
      });
      return res.status(200).json({ data: newDoc, message: "Document sent." });
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
