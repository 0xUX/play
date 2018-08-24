const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');
const compiledSchool = require('./build/School.json');

const provider = new HDWalletProvider(
    'call glow acoustic vintage front ring trade assist shuffle mimic volume reject',
    'https://rinkeby.infura.io/orDImgKRzwNrVCDrAk5Q'
);
const web3 = new Web3(provider);

const deploy = async () => {
    const accounts = await web3.eth.getAccounts();

    console.log('Attempting to deploy from account', accounts[0]);

    const result = await new web3.eth.Contract(JSON.parse(compiledSchool.interface))
                                 .deploy({ data: '0x' + compiledSchool.bytecode })
                                 .send({ from: accounts[0] });

    console.log('Contract deployed to', result.options.address);
};
deploy();

// Attempting to deploy from account 0xcF01971DB0CAB2CBeE4A8C21BB7638aC1FA1c38c
// Contract deployed to 0x2BD6bDb5Dab9c982D732b1fd995BB4F62D6d7A1f
