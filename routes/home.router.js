const express = require("express");
const router = express.Router();
const passport = require("passport");
const homeController = require("../controllers/home.controller");
const { loginValidator, registerValidator } = require("../validator");
router.get("/", homeController.getHome);
router.get("/search", homeController.searchPosts);
router.get("/categories/:slug", homeController.getCategory);
router.get("/tags/:slug", homeController.getTag);
router.get("/login", homeController.login);
router.post("/login", loginValidator(), homeController.login_post);
router.get(
  "/facebook",
  passport.authenticate("facebook", { scope: ["email"] })
);
router.get("/facebook/cb", homeController.facebook);
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get("/google/cb", homeController.google);
//passport.authenticate("facebook", { failureRedirect: "/login" }),
router.get("/register", homeController.register);
router.get("/register/code", homeController.getRegisterCode);
router.post("/register", registerValidator(), homeController.register_post);
router.get("/logout", homeController.logout);
router.get("/categories/:categorySLug/:postSlug", homeController.getPost);

module.exports = router;
