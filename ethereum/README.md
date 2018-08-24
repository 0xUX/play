## Set up

Set-up the compile and deploy functionality:

```
cd ethereum
nvm use 9
yarn
```

## Compile

Every time the contract(s) in the contracts directory change they need to be compiled:

```
cd ethereum
nvm use 9
node compile.js
```

The resulting compiled contracts can be found in the `build` directory.

## Deploy

The School.sol contract can be deployed to Rinkeby by:

```
cd ethereum
nvm use 9
node deploy.js
```

Make a note of the address of the contract after deployment.
