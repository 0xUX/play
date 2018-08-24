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

The resulting compiles contracts can bbe found in the `build` directory.

## Deploy

