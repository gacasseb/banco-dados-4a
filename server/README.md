## Project setup
```
npm install
```

### Run
```
node server.js
```

## To grant READ ONLY for user:
GRANT SELECT ON *.* TO 'user1'@'localhost'

## To grant operations for one user:
GRANT SELECT ON projeto4a.Empresa TO user2’@’localhost’;

## To create new user on database:
CREATE USER ‘local_user’@’localhost’ IDENTIFIED BY ‘password’;