const mongoose = require("mongoose");
const moment = require("moment-timezone");
const bcrypt = require("bcryptjs");
const uuidv4 = require("uuid").v4;
const config = require("./../config");
const jwt = require("jsonwebtoken");
const userSchema = new mongoose.Schema({
  fullName: String,
  email: String,
  username: String,
  password: String,
  DoB: Date,
  role: String,
  expire: Date,
  manager: String,
  pseudonym: String,
  isAdmin: Boolean,
  services: {
    facebook: String,
    google: String,
  },
  avatar: String,
});
userSchema.pre("save", async function save(next) {
  try {
    if (!this.isModified("password")) return next();

    const rounds = config.authentication.saltRounds;

    const hash = await bcrypt.hash(this.password, rounds);
    this.password = hash;

    return next();
  } catch (error) {
    return next(error);
  }
});

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */
userSchema.pre("update", async function (next) {
  try {
    if (!this.isModified("password")) return next();

    const rounds = config.authentication.saltRounds;

    const hash = await bcrypt.hash(this.password, rounds);
    this.password = hash;

    return next();
  } catch (error) {
    return next(error);
  }
});

userSchema.method({
  token() {
    const playload = {
      exp: moment().add(30, "days").unix(),
      iat: moment().unix(),
      id: this._id,
    };
    let token = jwt.sign(playload, config.authentication.jwtPrivateKey);

    return token;
  },

  async passwordMatches(password) {
    return bcrypt.compare(password, this.password);
  },
});
//static
userSchema.statics = {
  async oAuthLogin({ service, id, email, fullName, avatar }) {
  
    let user = await this.findOne({
      $or: [{ [`services.${service}`]: id }, { email }],
    });

    if (!user) {
      user = await this.create({
        services: { [service]: id },
        email,
        password: uuidv4(),
        fullName,
        avatar,
      });
    }
    let token = user.token();
    user = await user.toObject();
    user.token = token;
    return user;
  },
};
const User = mongoose.model("User", userSchema, "users");

module.exports = User;