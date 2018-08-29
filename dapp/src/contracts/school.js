import SchoolABI from './abi/School.json';

const CONTRACT_ADDRESS = '0xB90761cFb3f327F901024668CD2Eb73A191F06aA'; // On Rinkeby

const instance = (web3) => {
    return new web3.eth.Contract(
        JSON.parse(SchoolABI),
        CONTRACT_ADDRESS
    );
};

export default instance;
