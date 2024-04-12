/* eslint-disable no-undef */
import express from "express";
import { upload } from "../helper/multer.js";
import DocModel from "../model/Doc.js";
import mongoose from "mongoose";
import path from "path";
import { verifyToken } from "../middleware/auth.js";
import { sendMail } from "../helper/sendMail.js";
import { fileURLToPath } from "url";
import fs from "fs";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();

router.get("/reviewDocs", verifyToken, async (req, res) => {
  try {
    const docs = await DocModel.find({
      senderId: new mongoose.Types.ObjectId(req.user.id),
    });
    res.status(200).json({ message: "Found docs", data: docs });
  } catch (err) {
    console.log(req.user);
    console.log(err);
    res.status(500).json({ message: "Somthing went wrong." });
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const docData = await DocModel.findById(id).lean();
    console.log(docData);
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

router.put(
  "/:id",
  upload.fields([
    {
      name: "doc",
      maxCount: 1,
    },
  ]),
  async (req, res) => {
    const { id } = req.params;
    try {
      const doc = await DocModel.findById(id);

      if (doc) {
        const filePath = path.join(__dirname, "..", "uploads", doc.docUrl);

        fs.unlink(filePath, (err) => {
          if (err) {
            console.error("Error deleting previous certificate:", err);
          } else {
            console.log("Previous certificate deleted successfully");
          }
        });

        doc.status = "signed";
        doc.docUrl = req.docUrl;
        doc.url = req.url;
      }
      await doc.save({ validateBeforeSave: true });
      res.status(200).json({ message: "Document signed" });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ message: "Somthing went wrong" });
    }
  }
);

router.post(
  "/:num",
  verifyToken,
  (req, res, next) => {
    // Get the field names from req.files
    const { num } = req.params;
    const uploadFields = [];
    for (let i = 0; i < parseInt(num); i++) {
      uploadFields.push({ name: `docs[${i}].doc`, maxCount: 1 });
    }

    upload.fields(uploadFields)(req, res, next);
  },
  async (req, res) => {
    try {
      console.log(req.body);

      // const newDoc = new DocModel({
      //   coordinates: req.body.coordinates,
      //   docUrl: req.docUrl,
      //   doc: req.doc,
      //   receiverEmail: req.body.email,
      //   senderId: new mongoose.Types.ObjectId(req.user.id),
      // });
      // await newDoc.save({ validateBeforeSave: true });
      // await sendMail({
      //   from: {
      //     name: "Miracle e-signature",
      //     address: process.env.USER,
      //   },
      //   to: [req.body.email],
      //   subject: "Sign you doucument.",
      //   text: "Hello world",
      //   html: `<a href=${process.env.CLIENT_URL}/signDocument/${newDoc._id}>Sign document.</a>`,
      // });
      // return res.status(200).json({ data: newDoc, message: "Document sent." });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ message: "Somthing went wrong." });
    }
  }
);

export default router;
