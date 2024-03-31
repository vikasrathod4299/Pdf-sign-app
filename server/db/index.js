import mongoose from "mongoose";

export default (uri) =>
  mongoose
    // eslint-disable-next-line no-undef
    .connect(uri)
    .then(() => {
      console.log("Database is connected 📦");
    })
    .catch((err) => {
      console.log(err);
    });
