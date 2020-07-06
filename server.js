require("dotenv").config();
const express = require("express");
const exphbs = require("express-handlebars");
const cookieParser = require("cookie-parser");
const path = require("path");
const mongoose = require("mongoose");

//Connect db from mongodb
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});
//Give a notification when connect success
mongoose.connection.on("connected", () => {
  console.log("Mongoose is connected !!!");
});

const app = express();
const router = require("./routes");
//For Cookie-parser
app.use(cookieParser());
//For body parser
app.use(express.urlencoded({ extended: false }));
//For public static file
app.use(express.static("public"));
//For view engine
require("./middlewares/view.mdw")(app);
require("./middlewares/locals.mdw")(app);
//mdw
app.use(require("./middlewares/auth.mdw").parseTokenToUser);
//auth
require("./utils/passport")(app);
//Router
app.use("/", router);

app.listen(process.env.PORT, function () {
  console.log(`server is connected from port ${process.env.PORT}`);
});
