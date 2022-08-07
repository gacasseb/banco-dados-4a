import logo from './logo.svg';
import './App.css';
import axios from 'axios';

import { useEffect, useState } from 'react';

function App() {

  const fetchCompanys = () => {
    axios.get('http://localhost:6868/empresa')
    .then(res => {
      setCompanys(res.data);
    });
  }

  const companyOption = () => {
    let options = [];
    if ( companys ) {
      options = companys.map(company => {
        return (
          <option key={company.id} value={company.id}>{company.nome}</option>
        )
      });

      options.unshift(<option key={0} value={0}>Selecione uma empresa</option>);

      return <select id="selectCompany" className="form-select" onChange={e => setCompany(e.target.value)}>{options}</select>
    }
  }

  const accountOption = () => {
    let options = [];
    if ( accounts ) {
      options = accounts.map((account, index) => {
        return (
          <option key={account.id} value={index}>{account.id}</option>
        )
      });
    }

    options.unshift(<option key={0} value={0}>Selecione uma conta</option>);

    return <select id="selectAccount" className="form-select" onChange={e => setAccount(accounts[e.target.value])}>{options}</select>
  }

  const submit = () => {
    let data = {
      transaction: {
        ...transaction,
        account: account.id
      }
    };

    if ( transaction.type == 'receita' ) {
      data.transaction.type = 3;
    } else {
      data.transaction.type = 2;
    }

    axios.post('http://localhost:6868/insert-transaction', data)
    .then(res => {
      alert('Transação salva com sucesso.');
    })
    .catch(err => {
      alert('OCORREU UM ERRO.');
    })
  }

  const [companys, setCompanys] = useState([]);
  const [company, setCompany] = useState(0);
  const [accounts, setAccounts] = useState([]);
  const [account, setAccount] = useState({});
  const [transaction, setTransaction] = useState({});

  useEffect(() => {
    fetchCompanys();
  }, []);

  useEffect(() => {
    if ( company == 0 ) return;
    axios.get(`http://localhost:6868/conta/${company}`)
    .then(res => {
      setAccounts(res.data);
    })
    .catch(err => {
      setAccounts([]);
      setAccount({});
    });
  }, [company]);

  return (
    <div className="App">
      <div className="container" style={{maxWidth: '40%'}}>
        <form>
          <div className="mb-3">
            <label htmlFor="selectCompany" className="form-label">Selecione a empresa</label>
            {companyOption()}
          </div>
          <div className="mb-3 row">
            <div className="col-4">
              <label htmlFor="selectAccount" className="form-label">Selecione a conta</label>
              {accountOption()}
            </div>
            <div className="col-6">
              <label htmlFor="accountName" className="form-label">Nome da conta</label>
              <input className="form-control" disabled value={getAccountName(account)}></input>
            </div>
            <div className="col-2">
              <label htmlFor="accountBalance" className="form-label">Saldo</label>
              <input className="form-control" disabled value={'R$ '+ parseFloat(account.saldo_atual)}></input>
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-4">
              <label htmlFor="date" className="form-label">Data</label>
              <input className="form-control" onChange={e => setTransaction({...transaction, date: e.target.value})}></input>
            </div>
            <div className="col-4">
              <label htmlFor="date" className="form-label">Tipo de transação</label>
              <select name="tipo" className="form-select" onChange={e => setTransaction({...transaction, type: e.target.value})}>
                <option>Selecione o tipo de transacao</option>
                <option value='receita'>Receita</option>
                <option value='despesa'>Despesa</option>
              </select>
            </div>
            <div className="col-4">
              <label htmlFor="typeName" className="form-label">Nome do tipo</label>
              <input className="form-control"></input>
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-4">
              <label htmlFor="nroDoc" className="form-label">Nro documento</label>
              <input className="form-control" onChange={e => setTransaction({...transaction, doccument: e.target.value})}></input>
            </div>
            <div className="col-4">
              <label htmlFor="obs" className="form-label">Observações</label>
              <input className="form-control" onChange={e => setTransaction({...transaction, obs: e.target.value})}></input>
            </div>
            <div className="col-4">
              <label htmlFor="value" className="form-label">Valor</label>
              <input className="form-control" onChange={e => setTransaction({...transaction, value: parseFloat(e.target.value)})}></input>
            </div>
          </div>

          <button type="button" className="btn btn-primary" onClick={submit}>Registrar</button>
        </form>
      </div>
    </div>
  );
}

function getAccountName(account) {
  if ( account && account.nome ) {
    return account.nome;
  } else {
    return '';
  }
}

export default App;
