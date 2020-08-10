const moment = require("moment");
const { userModel } = require("../models");
const bcrypt = require("bcryptjs");
const saltRounds = 10;
module.exports.getProfile = async (req, res) => {
  try {
    let { user } = req;
    res.render("home/profile", { user, activeFeature: 10 });
  } catch (error) {
    res.render("errors/404", { errors: error.toString(), layout: false });
  }
};

module.exports.editNameProfile = async (req, res) => {
  try {
    const { user } = req;
    let isErrorsName = false;
    const { fullName } = req.body;
    if (fullName != "") {
      await userModel.updateOne(
        { _id: user._id },
        {
          fullName: fullName,
        }
      );
    } else {
      isErrorsName = true;
      const messError = "Tên mới không được trống.";
      res.render("home/profile", {
        user,
        isErrorsName,
        messError,
      });
    }
    if (isErrorsName == false) {
      res.redirect(`/${user.role}/profile`);
    }
  } catch (error) {
    res.render("errors/404", { errors: error.toString(), layout: false });
  }
};

module.exports.editNameAvatar = async (req, res) => {
  try {
    const { file: avatar, user } = req;
    let isErrorsImg = false;
    console.log(avatar);
    if (avatar) {
      await userModel.updateOne(
        { _id: user._id },
        {
          avatar: avatar.path.replace("public", ""),
        }
      );
    } else {
      isErrorsImg = true;
      const messError = "Chưa chọn file.";
      res.render("home/profile", {
        user,
        isErrorsImg,
        messError,
      });
    }
    if (isErrorsImg == false) {
      res.redirect(`/${user.role}/profile`);
    }
  } catch (error) {
    res.render("errors/404", { errors: error.toString(), layout: false });
  }
};

module.exports.editDoBProfile = async (req, res) => {
  try {
    const { user } = req;
    let isErrorsDoB = false;
    const { newdob } = req.body;
    if (newdob) {
      let dob = moment(newdob).format("YYYY-MM-DD");
      await userModel.updateOne(
        { _id: user._id },
        {
          dob,
        }
      );
    } else {
      isErrorsDoB = true;
      const messError = "Ngày sinh không hợp lệ.";
      res.render("home/profile", {
        user,
        isErrorsDoB,
        messError,
      });
    }
    if (isErrorsDoB == false) {
      res.redirect(`/${user.role}/profile`);
    }
  } catch (error) {
    res.render("errors/404", { errors: error.toString(), layout: false });
  }
};

module.exports.editPasswordProfile = async (req, res) => {
  try {
    const { user } = req;
    let isErrorsPass = false;
    const { newPassword, currentPassword, confirmPassword } = req.body;
    if (user.firstChangePass) {
      if (newPassword != "" && confirmPassword != "" && currentPassword != "") {
        let comparePasswordResult = await bcrypt.compareSync(
          currentPassword,
          user.localPassword
        );
        if (comparePasswordResult) {
          if (newPassword === confirmPassword) {
            const localPassword = bcrypt.hashSync(newPassword, saltRounds);
            await userModel.updateOne(
              { _id: user._id },
              {
                localPassword,
              }
            );
          } else {
            isErrorsPass = true;
            const messError =
              "Mật khẩu mới và mật khẩu xác thực phải giống nhau.";
            res.render("home/profile", { user, isErrorsPass, messError });
          }
        } else {
          isErrorsPass = true;
          const messError = "Mật khẩu hiện tại không đúng.";
          res.render("home/profile", { user, isErrorsPass, messError });
        }
      } else {
        isErrorsPass = true;
        const messError =
          "Mật khẩu mới, mật khẩu xác thực hoặc mật khẩu hiện tại không dược trống.";
        res.render("home/profile", { user, isErrorsPass, messError });
      }
    } else {
      const firstChangePass = true;
      if (newPassword != "" && confirmPassword != "") {
        if (newPassword === confirmPassword) {
          const localPassword = bcrypt.hashSync(newPassword, saltRounds);
          console.log(localPassword);
          await userModel.updateOne(
            { _id: user._id },
            {
              localPassword,
              firstChangePass,
            }
          );
        } else {
          isErrorsPass = true;
          const messError =
            "Mật khẩu mới và mật khẩu xác thực phải giống nhau.";
          res.render("home/profile", { user, isErrorsPass, messError });
        }
      } else {
        isErrorsPass = true;
        const messError =
          "Mật khẩu mới hoặc mật khẩu xác thực không được trống.";
        res.render("home/profile", { user, isErrorsPass, messError });
      }
    }
    if (isErrorsPass == false) {
      res.redirect(`/${user.role}/profile`);
    }
  } catch (error) {
    res.render("errors/404", { errors: error.toString(), layout: false });
  }
};
