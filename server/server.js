require("dotenv").config();
const express = require("express");
const cors = require("cors");
var mysql = require('mysql');

const app = express();

var corsOptions = {
  origin: "http://localhost:8081"
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// set port, listen for requests
const PORT = process.env.NODE_DOCKER_PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on that fucking port ${PORT}.`);
});

var con = mysql.createConnection({
  host: 'mysqldb',
  user: 'root',
  password: '123456',
  database: 'projeto2a'
});

con.connect(err => {
  if (err) {
    throw err;
  }
  console.log('Banco de dados conectado com sucesso!');
});

const queries = require('./app/controllers/queries');

// simple route
app.get("/", (req, res) => {
  res.json({ message: "i'm alive." });
});

app.get('/consulta-completa', (req, res) => {
  queries.viewCompleta(req, res, con);
});