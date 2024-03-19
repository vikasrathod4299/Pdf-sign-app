import UserModel from "../model/User.js";
import jwt from "jsonwebtoken";

export const verifyToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    // eslint-disable-next-line no-undef
    jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
      if (err) {
        return res
          .status(403)
          .json({ message: "Your session is expired, please login again." });
      } else {
        const userData = await UserModel.findById(user.id);
        if (userData) {
          req.user = userData;
          return next();
        } else {
          return next({
            message: "You are not allowed to do that",
            statusCode: 401,
          });
        }
      }
    });
  } else {
    return next({ message: "You are not authenticated", statusCode: 401 });
  }
};
