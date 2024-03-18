/* eslint-disable no-undef */

import nodeMailer from "nodemailer";

const transpoter = nodeMailer.createTransport({
  service: "gmail",
  host: "smpt.gmail.com",
  secure: false,
  auth: {
    user: process.env.USER,
    pass: process.env.APP_PASSWORD,
  },
});

export const sendMail = async (mailOptions) => {
  try {
    await transpoter.sendMail(mailOptions);
    console.log("Mail sent.");
  } catch (err) {
    console.log(err);
  }
};
