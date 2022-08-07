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
        if ( parseFloat(saldo_atual) < 0 ) {
          throw new Error('Saldo insuficiente');
        }
      }

      await createTransaction({
        ...transaction,
        balance: saldo_atual
      }, connection);

      console.log('transaction inserted');

      let update = await updateAccountBalance(transaction.account, saldo_atual, connection);
      console.log('saldo da conta atualizada com sucesso, novo saldo: ', saldo_atual);
      // throw new Error("Algo inesperado aconteceu.");
      
      await connection.commit();

      res.json(type);

    } catch (error) {

      console.log('entrou no catch', error);
      connection.rollback();
      res.status(400).json(error.message);
    }
  },
  
  selectTransactions: async (req, res, connection) => {
    const company = req.body.company;
    const account = req.body.account;
    let query = `select Empresa.nome as empresa, Conta.nome, Conta.saldo_atual, Transacao.data, Transacao.numero_documento, Transacao.valor, Transacao.saldo, Transacao.observacao from Empresa
    INNER JOIN Conta
    ON Conta.Empresa_id = Empresa.id
    INNER JOIN Transacao
    ON Transacao.Conta_id = Conta.id
    where Empresa.id = ${company} and Conta.id = ${account};`;

    let result = await connection.query(query).catch(err => res.status(400).json(err));

    if ( Array.isArray(result) && result.length > 0 ) {
      printScreen1(result);
    } else {
      return res.status(400).json({msg: "Não há transações para esta conta."});
    }

    res.json(result);
  },

  selectTransactionsByTipeRange: async (req, res, connection) => {

    let params = req.body;

    // let conditions = `Empresa.id = (?) and Tipo_Transacao.tipo = (?) and Transacao.data between (?) and (?)`;
    let conditions = `Empresa.id = (?) and Transacao.data between (?) and (?)`;
    let values = [
      params.company, // id da empresa
      // params.type, // receita ou despesa
      params.date[0],
      params.date[1]
    ];

    if (params.account) {
      conditions += `and Conta.id = (?)`;
      values.push(params.account);
    }

    let query = `select Empresa.nome as empresa, Tipo_Transacao.nome as tipo_nome, Tipo_Transacao.tipo as tipo, Conta.nome, Conta.saldo_atual, Transacao.data, Transacao.numero_documento, Transacao.valor, Transacao.saldo, Transacao.observacao from Empresa
    INNER JOIN Conta
    ON Conta.Empresa_id = Empresa.id
    INNER JOIN Transacao
    ON Transacao.Conta_id = Conta.id
    INNER JOIN Tipo_Transacao
    ON Transacao.Tipo_Transacao_id = Tipo_Transacao.id
    where ${conditions}`;

    let result = await connection.query(query, values).catch(err => res.status(400).json(err));

    if ( Array.isArray(result) && result.length > 0 ) {
      printScreen2(result);
    } else {
      return res.status(400).json({msg: "Não foram encontradas transações."});
    }

    res.json(result);
  },

  getCompanys: async (req, res, connection) => {
    let query = `select * from Empresa`;

    let result = await connection.query(query).catch(err => res.status(400).json(err));

    if ( Array.isArray(result) && result.length > 0 ) {
      // printScreen2(result);
    } else {
      return res.status(400).json({msg: "Não foram encontradas empresas."});
    }

    res.json(result);
  },

  getAccount: async (req, res, connection) => {
    if ( !req.params.id || req.params.id == 0 ) {
      return res.status(404).json({msg: "ID da conta não enviado."});
    }
    let query = `select * from Conta where Conta.Empresa_id = ${req.params.id}`;

    let result = await connection.query(query).catch(err => res.status(400).json(err));

    if ( Array.isArray(result) && result.length > 0 ) {
      // printScreen2(result);
    } else {
      return res.status(404).json({msg: "Não foram encontradas contas."});
    }

    res.json(result);
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
  const sql = `INSERT INTO Transacao(data, valor, numero_documento, observacao, saldo, Conta_id, Tipo_Transacao_id) VALUES (?)`;
  let values = [
    [
      // new Date().toISOString().slice(0, 19).replace("T", " "),
      transaction.date,
      transaction.value,
      transaction.doccument,
      transaction.obs,
      transaction.balance,
      transaction.account,
      transaction.type
    ]
  ];

  console.log('values', values);

  return connection.query(sql, values);
}

function printScreen1(transactions) {
  console.log(`\nEmpresa cadastrada: ${transactions[0].empresa}`);
  console.log(`Conta: ${transactions[0].nome} `, `Saldo atual: R$ ${parseFloat(transactions[0].saldo_atual)}`);

  printTransactions(transactions);
}

function printScreen2(transactions) {
  console.log(`\nEmpresa cadastrada: ${transactions[0].empresa}`);
  console.log(`Conta: ${transactions[0].nome} `, `Saldo atual: R$ ${parseFloat(transactions[0].saldo_atual)}`);

  printTransactionsByType(transactions);
}

function printTransactions(transactions) {
  let rows = [];

  transactions.forEach(transaction => {

    let date = new Date(transaction.data);
    rows.push({
      Data: (date.getDate() + 1) + '/' + date.getMonth() + '/' + date.getFullYear(),
      nroDoc: transaction.numero_documento,
      Valor: 'R$ ' + parseFloat(transaction.valor),
      Saldo: 'R$ ' + transaction.saldo
    });
  });

  console.table(rows);
}

function printTransactionsByType(transactions) {
  let rows = [];
  let totalIncome = 0, totalExpense = 0;

  transactions.forEach(transaction => {

    if ( transaction.tipo == 'receita') {
      totalIncome += parseFloat(transaction.valor);
    } else {
      totalExpense += parseFloat(transaction.valor);
    }

    let date = new Date(transaction.data);
    rows.push({
      Despesa: transaction.tipo_nome,
      Data: (date.getDate() + 1) + '/' + date.getMonth() + '/' + date.getFullYear(),
      'Valor Total': 'R$ ' + parseFloat(transaction.valor),
      // Saldo: 'R$ ' + transaction.saldo
    });
  });
  
  console.table(rows);

  console.log(`\Total receita: R$ ${totalIncome}`);
  console.log(`\Total despesa: R$ ${totalExpense}`);
}

module.exports = queries;