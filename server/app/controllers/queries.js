const queries = {
  viewCompleta: (req, res, connection) => {
    connection.query("SELECT * FROM projeto2a.consultaCompleta", (err, result, fields) => {
      if (err) {
        throw err;
      }

      res.send(result);
    });
  },

  queryByExam: (req, res, connection) => {

    let exam = 'Exame de covid';

    const sql = `SELECT * FROM consultaPacientes\
    INNER JOIN Exame\
    ON idConsulta = Exame.Consulta_idConsulta\
    INNER JOIN TipoExame\
    ON Exame.TipoExame_idTipoExame = TipoExame.idTipoExame\
    WHERE TipoExame.nomeTipoExame = '${exam}';`;

    connection.query(sql, (err, result, fields) => {
      if (err) {
        throw err;
      }

      res.send(result);
    });
  },

  queryByMedic: (req, res, connection) => {

    crm = '123456789';

    const sql = `SELECT * FROM consultaPacientes\
    WHERE crmMedico = '${crm}';`;

    connection.query(sql, (err, result, fields) => {
      if (err) {
        throw err;
      }

      res.send(result);
    });
  },

  queryByCity: (req, res, connection) => {

    let year = '2021';
    let city = 'Foz do Iguaçu';
  
    const sql = `SELECT * FROM consultaPacientes\
    INNER JOIN Endereco\
    ON Endereco_idEndereco = Endereco.idEndereco\
    INNER JOIN Cidade\
    ON Endereco.Cidade_idCidade = idCidade\
    WHERE Cidade.nomeCidade = '${city}'\
    AND YEAR(dataConsulta) = ${year};`;

    connection.query(sql, (err, result, fields) => {
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