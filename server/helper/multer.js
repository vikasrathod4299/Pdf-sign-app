import path from "node:path";
import multer from "multer";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // eslint-disable-next-line no-undef
    const storagePath = path.join(__dirname + "/..", `uploads`);
    if (!fs.existsSync(storagePath)) {
      fs.mkdirSync(storagePath);
    }
    cb(null, storagePath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const pdfUrl = `${file.fieldname}-${uniqueSuffix}-.pdf`;
    req.pdf.push(file.originalname);
    req.pdfUrl.push(pdfUrl);
    cb(null, pdfUrl);
  },
});

// eslint-disable-next-line no-unused-vars
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1000 * 1000,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      return cb(new Error("Only PDF files are allowed"));
    }
  },
});
