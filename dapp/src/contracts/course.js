import CourseABI from './abi/Course.json';

const instance = (web3, address) => {
    return new web3.eth.Contract(
        JSON.parse(CourseABI),
        address
    );
};

export default instance;
