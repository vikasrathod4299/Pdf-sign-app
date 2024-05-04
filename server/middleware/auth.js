import jwt from "jsonwebtoken";

export const verifyToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    // eslint-disable-next-line no-undef
    if (token) {
      const data = jwt.decode(token);
      if (data?.loginId) {
        req.user = data;
        return next();
      }
      return { statusCode: 403, message: "Token is invalid" };
    }
    return next({ message: "You are not authenticated", statusCode: 401 });
  }
};
