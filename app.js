const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const app = express();
const port = 3000;

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.set("view engine", "ejs");

const mysql = require("mysql2");

const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "rootroot",
  database: "ecsite_db",
  multipleStatements: true,
});

// cssファイルの取得
app.use(express.static("assets"));

// mysqlからデータを持ってくる
app.get("/", (req, res) => {
  // 初期データ
  const sql = "SELECT * from goods;";
  const sql2 = "SELECT * from review;";

  // ソート用データ(ASC:昇順、DESC:降順)
  const asc = "SELECT * from goods ORDER BY price ASC;";
  const desc = "SELECT * from goods ORDER BY price DESC;";
  const asc50on = "SELECT * from goods ORDER BY name ASC;";
  const ratingAVG = "SELECT itemId,AVG(evaluation) FROM review GROUP BY itemId;";
  const reviewCOUNT = "SELECT itemId,COUNT(itemId) FROM review GROUP BY itemId;";

  // 買い物かごデータ
  const shoppingbasket = "SELECT * from shoppingbasket;";

  con.query(
    sql + sql2 + asc + desc + asc50on + ratingAVG + reviewCOUNT + shoppingbasket,
    function (err, result, fields) {
      if (err) throw err;
      res.render("index", {
        users: result[0],
        users2: result[1],
        priceASC: result[2],
        priceDESC: result[3],
        asc50on: result[4],
        ratingAVG: result[5],
        reviewCOUNT: result[6],
        shoppingbasket: result[7],
      });
    }
  );
});

app.post("/", (req, res) => {
  const sql = "INSERT INTO shoppingbasket SET ?";

  con.query(sql, req.body, function (err, result, fields) {
    if (err) throw err;
    console.log(result);
    res.redirect("/");
  });
});

app.get("/edit/:id", (req, res) => {
  const sql = "SELECT * FROM goods WHERE id = ?;";
  // ソート用データ(def:デフォルト、ASC:昇順、DESC:降順)
  const def = "SELECT * from review;";
  const asc = "SELECT * from review ORDER BY evaluation ASC;";
  const desc = "SELECT * from review ORDER BY evaluation DESC;";
  con.query(sql + def + asc + desc, [req.params.id], function (err, result, fields) {
    if (err) throw err;
    res.render("edit", {
      user: result[0],
      def: result[1],
      asc: result[2],
      desc: result[3],
    });
  });
});

app.get("/shoppingBag", (req, res) => {
  const shoppingbasket = "SELECT * from shoppingbasket;";
  const sumPrice = "select SUM(price) from shoppingbasket;";

  con.query(
    shoppingbasket + sumPrice,
    function (err, result, fields) {
      if (err) throw err;
      res.render("shoppingBag", {
        shoppingbasket: result[0],
        sumPrice: result[1],
      });
    }
  );
});

app.post("/update/:id", (req, res) => {
  console.log(req.params.id);
  const sql = "UPDATE goods SET ? WHERE id = " + req.params.id;
  con.query(sql, req.body, function (err, result, fields) {
    if (err) throw err;
    console.log(result);
    res.redirect("/");
  });
});

app.get("/delete/:itemId", (req, res) => {
  const sql = "DELETE FROM shoppingbasket WHERE itemId = ?";
  con.query(sql, [req.params.itemId], function (err, result, fields) {
    if (err) throw err;
    console.log(result);
    res.redirect("/shoppingBag");
  });
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
