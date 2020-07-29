const passport = require("passport");
const passportFacebook = require("passport-facebook");
const { userModel } = require("../../models");
const FacebookStrategy = passportFacebook.Strategy;

const strategy = (app) => {
  const strategyOptions = {
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: `${process.env.SERVER_API_URL}/facebook/cb`,
    profileFields: ["id", "displayName", "name", "emails", "photos"],
  };

  const verifyCallback = async (accessToken, refreshToken, profile, done) => {
    let { id, email, first_name, last_name, picture, username } = profile._json;
    console.log(profile);
    let user = await userModel.oAuthLogin({
      service: "facebook",
      id,
      email,
      fullName: `${first_name} ${last_name}`,
      avatar: `https://graph.facebook.com/${id}/picture?height=120&width=120`,
      username,
    });

    return done(null, user);
  };

  passport.use(new FacebookStrategy(strategyOptions, verifyCallback));

  return app;
};

module.exports = strategy;
