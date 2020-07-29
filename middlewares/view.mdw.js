const exphbs = require("express-handlebars");
const hbs_sections = require("express-handlebars-sections");
var paginate = require("handlebars-paginate");
const numeral = require("numeral");
const moment = require("moment");
const { ObjectId } = require("mongodb");
module.exports = function (app) {
  app.engine(
    "hbs",
    exphbs({
      layoutsDir: "views/_layouts",
      defaultLayout: "main",
      partialsDir: "views/_partials",
      extname: ".hbs",
      helpers: {
        section: hbs_sections(),
        format_number: function (value) {
          return numeral(value).format("0,0");
        },
        stringify: function (v) {
          return JSON.stringify(v);
        },
        date: function (date, format) {
          return date instanceof Date ? moment(date).format(format) : null;
        },
        when: function (operand_1, operator, operand_2, options) {
          var operators = {
            eq: function (l, r) {
              return l == r;
            },
            noteq: function (l, r) {
              return l != r;
            },
            gt: function (l, r) {
              return Number(l) > Number(r);
            },
            lt: function (l, r) {
              console.log(l, r);
              return Number(l) < Number(r);
            },
            or: function (l, r) {
              return l || r;
            },
            and: function (l, r) {
              return l && r;
            },
            "%": function (l, r) {
              return l % r === 0;
            },
            in: function (l, r) {
              return r.includes(l);
            },
          };

          let result = operators[operator](operand_1, operand_2);

          if (result) return options.fn(this);
          else return options.inverse(this);
        },
        calc: function (operand_1, operator, operand_2, options) {
          var operators = {
            "+": function (l, r) {
              return l + r;
            },
            "-": function (l, r) {
              return l - r;
            },
          };

          let result = operators[operator](operand_1, operand_2);

          return result;
        },
        paginate,
      },
    })
  );
  app.set("view engine", "hbs");
};
