require("dotenv").config();
const express = require("express");
const cors = require("cors");
const util = require("util");
var mysql = require('mysql');

const app = express();

var corsOptions = {
  origin: "http://localhost:3000"
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.NODE_DOCKER_PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

var con = mysql.createConnection({
  host: 'mysqldb',
  user: 'root',
  password: '123456',
  database: 'projeto4a'
});

con.query = util.promisify(con.query).bind(con);

con.connect(err => {
  if (err) {
    throw err;
  }
  console.log('Banco de dados conectado com sucesso!');
});

const queries = require('./app/controllers/queries');

app.get("/", (req, res) => {
  res.json({ message: "aloha!" });
});

app.post('/insert-transaction', (req, res) => {
  queries.insertTransaction(req, res, con);
});

app.post('/select-transaction', (req, res) => {
  queries.selectTransactions(req, res, con);
});

app.post('/select-transaction-range', (req, res) => {
  queries.selectTransactionsByTipeRange(req, res, con);
});

app.get('/empresa', (req, res) => {
  queries.getCompanys(req, res, con);
});

app.get('/conta/:id', (req, res) => {
  queries.getAccount(req, res, con);
});