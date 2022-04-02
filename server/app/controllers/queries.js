const queries = {
  viewCompleta: (req, res, connection) => {
    connection.query("SELECT * FROM projeto2a.consultaCompleta", (err, result, fields) => {
      if (err) {
        throw err;
      }

      res.send(result);
    });
  },

  viewCovid: (req, res, connection) => {
    connection.query("SELECT * FROM projeto2a.consultaCompleta", (err, result, fields) => {
      if (err) {
        throw err;
      }

      res.send(result);
    });
  },

  viewPacientes: (req, res, connection) => {
    connection.query("SELECT * FROM projeto2a.consultaPacientes", (err, result, fields) => {
      if (err) {
        throw err;
      }

      res.send(result);
    });
  }
};

module.exports = queries;