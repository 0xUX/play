import SchoolABI from './abi/School.json';

// const CONTRACT_ADDRESS = '0xB90761cFb3f327F901024668CD2Eb73A191F06aA'; // OLD On Rinkeby
const CONTRACT_ADDRESS = '0x9C4863391838293b1cF042850F6484f92121f7b7'; // On Rinkeby

const instance = (web3) => {
    return new web3.eth.Contract(
        JSON.parse(SchoolABI),
        CONTRACT_ADDRESS
    );
};

export default instance;
