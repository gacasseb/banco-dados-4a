const queries = {
  insertTransaction: async (req, res, connection) => {

    const transaction = req.body.transaction;

    await connection.beginTransaction();

    try {

      let type = await getTransactionType(transaction.type, connection);

      if (type.length == 0) {
        res.status(404).json({message: "Tipo de transação não encontrado"});
        return;
      }

      let account = await getAccount(transaction.account, connection);

      if (account.length == 0) {
        res.status(404).json({message: "Conta não encontrada"});
        return;
      }

      // Soma ao saldo atual da conta
      if ( type[0].tipo == 'receita' ) {
        var saldo_atual = parseFloat(account[0].saldo_atual) + parseFloat(transaction.value);
      } else {
        var saldo_atual = parseFloat(account[0].saldo_atual) - parseFloat(transaction.value);
      }

      await createTransaction({
        ...transaction,
      });

      let update = await updateAccountBalance(transaction.account, saldo_atual, connection);
      console.log('update', update);

      await connection.commit();

      res.json(type);

    } catch (error) {

      console.log('entrou no catch', error);
      connection.rollback();
      res.status(400).send("Error!");
    }
  },
};

function updateAccountBalance(accountId, value, connection) {
  const sql = `UPDATE Conta SET saldo_atual = ${value} WHERE Conta.id = ${accountId}`;
  console.log('Executando update', sql);
  return connection.query(sql);
}

function getAccount(accountId, connection) {
  const sql = `SELECT saldo_atual FROM Conta WHERE id = ${accountId}`;
  return connection.query(sql);
}

function getTransactionType(transactionId, connection) {
  const sql = `SELECT tipo FROM Tipo_Transacao WHERE id = ${transactionId}`;
  return connection.query(sql);
}

function createTransaction(transaction, connection) {
  const sql = `INSERT INTO Transacao VALUES (data, valor, numero_documento, observacao, saldo, Conta_id, Tipo_Transacao_id)`;
  return connection.query(sql);
}

module.exports = queries;