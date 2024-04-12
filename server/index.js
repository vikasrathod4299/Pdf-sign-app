/* eslint-disable no-undef */
import express from "express";
import "dotenv/config.js";
import cors from "cors";
import db from "./db/index.js";
import authRoute from "./routes/auth.routes.js";
import docRoute from "./routes/doc.routes.js";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3000;
db(process.env.DB_URI);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cors());
app.use("/api/uploads", express.static(path.join(__dirname, "uploads")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/api/auth", authRoute);
app.use("/api/doc", docRoute);
app.listen(PORT, () => console.log(`Server is listening on port ${PORT} 🚀`));
