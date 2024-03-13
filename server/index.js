/* eslint-disable no-undef */
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import db from "./db/index.js";
import authRoute from "./routes/auth.routes.js";
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
db(process.env.DB_URI);

app.use(cors({ origin: [process.env.CLIENT_URL], credentials: true }));
app.use(express.json());

app.use("/api/auth", authRoute);

app.listen(PORT, () => console.log(`Server is listening on port ${PORT} 🚀`));
