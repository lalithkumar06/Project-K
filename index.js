require("dotenv").config();
const express = require("express");
const path = require("path");
const app = express();

app.get("/create", (req, res) => {
  res.sendFile(path.join(__dirname, "create.html"));
});

app.get("/loginpage", (req, res) => {
  res.sendFile(path.join(__dirname, "loginpage.html"));
});

app.listen(process.env.PORT, () => {
  console.log("Server is up");
});
