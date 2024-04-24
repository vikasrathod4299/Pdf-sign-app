import express from "express";
import User from "../model/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const router = express.Router();

router.post("/register", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = new User({
        ...req.body,
        password: hashedPassword,
      });
      await newUser.save({ validateBeforeSave: true });
      return res.status(200).json({ message: "User registred successfully" });
    }
    return res.status(409).json({ message: "User already exist." });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Somthing went wrong." });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (user) {
      if (await bcrypt.compare(password, user.password)) {
        const { password: ignorePassword, ...rest } = user._doc;
        const token = jwt.sign(
          { id: user._id, email: user.email },
          process.env.JWT_SECRET,
          { expiresIn: "7d" }
        );
        res.cookie("token", token, { httpOnly: true, secure: true });
        return res.status(200).json({
          message: "You are logged in successfull!",
          data: { ...rest, token },
        });
      }
      return res.status(401).json({ message: "Wrong password." });
    }
    return res.status(404).json({ message: "User dose not exist." });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Somthing went wrong!" });
  }
});

export default router;
