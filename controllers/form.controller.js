const bcrypt = require("bcryptjs");
const saltRounds = 10;
const moment = require("moment");
const jwt = require("jsonwebtoken");
const { userModel } = require("../models");
const mailgun = require("mailgun-js");

const DOMAIN = "sandboxbd5d77e98bba40fc90395378395024de.mailgun.org";
const mg = mailgun({ apiKey: process.env.MAILGUM_API_KEY, domain: DOMAIN });
module.exports.forget = (req, res) => {
  res.locals.header = false;
  res.render("home/forget");
};
module.exports.forget_post = async (req, res) => {
  const { email } = req.body;
  userModel.findOne({ email }, (err, user) => {
    if (err || !user) {
      let messErr = "Email Không tồn tại.";
      return res.render("home/forget", { messErr });
    }
    const token = jwt.sign(
      {
        idUser: user._id,
      },
      process.env.RESET_PASSWORD_KEY,
      { expiresIn: "3m" }
    );
    const data = {
      from: "1760323@student.hcmus.edu.vn",
      to: email,
      subject: "Account Actication Link",
      html: `<h2>Please click on given link to reset you account</h2>
        <p>${process.env.SERVER_API_URL}/form/resetpassword/${token}</p>`,
    };
    mg.messages().send(data, function (error, body) {
      if (error) {
        return res.json({
          error: error.message,
        });
      }
      return res.render("home/mess", {
        mess:
          "Link yêu cầu reset Password đã gửi đến email của bạn. Link hết hiệu lực sau 3 phút.",
      });
    });
  });
};
module.exports.resetpassword = (req, res) => {
  res.render("home/reset");
};
module.exports.resetpassword_post = async (req, res) => {
  try {
    const { newPassword, confirmPassword } = req.body;
    const { token } = req.params;
    jwt.verify(token, process.env.RESET_PASSWORD_KEY, async function (
      err,
      decoded
    ) {
      if (err) {
        return res.render("home/mess", {
          mess: "Link yêu cầu reset Password đã hết hạn.",
          isError: true,
        });
      }
      if (newPassword != "" && confirmPassword != "") {
        if (newPassword === confirmPassword) {
          const localPassword = bcrypt.hashSync(newPassword, saltRounds);
          await userModel.updateOne(
            { _id: decoded.idUser },
            {
              localPassword,
            }
          );
          return res.redirect("/");
        } else {
          let messErr = "Mật khẩu mới và mật khẩu xác thực phải giống nhau.";
          return res.render("home/reset", { messErr });
        }
      } else {
        let messErr = "Mật khẩu mới, mật khẩu xác thực không dược trống.";
        return res.render("home/reset", { messErr });
      }
    });
  } catch (error) {}
};
