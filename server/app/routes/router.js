module.exports = app => {
  var router = require("express").Router();

  // Retrieve all Tutorials
  router.get("/", (req, res) => {
    res.send("I'm alive!");
  });
};
