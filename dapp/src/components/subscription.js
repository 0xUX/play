import React, { Component } from "react";
import PropTypes from 'prop-types';
import Web3 from 'web3'; // for subscriptions to work we need 1.0.0-beta.33 (so not the latest) see https://github.com/ethereum/web3.js/issues/1559 @@@
import _ from 'lodash';
import { Loader } from 'semantic-ui-react';
import { networkDetails } from '../lib/network';
import { getEventAbi} from '../lib/eth';
import CourseABI from '../contracts/abi/Course.json';
import SchoolABI from '../contracts/abi/School.json';


// @@@ TODO:
// - when user changes network on MM, do the same on Infura for subscriptions
// - https://web3js.readthedocs.io/en/1.0/web3-eth-subscribe.html#subscribe-syncing
// - combine logs found with getPastLogs and subscribe
// - error handling: each network error flow gets its own state

let subscriptionNetwork = networkDetails('rinkeby');
const FROM_BLOCK = 2864371; // No need to look before this block on rinkeby
let web3;

export default class Subscribe extends Component {
    state = {
        block: 0,
        courses: []
    }

    componentDidMount() {
        let provider = new Web3.providers.WebsocketProvider(subscriptionNetwork.websocketUrl);
        web3 = new Web3(provider);
        provider.on('error', e => console.log('Websocket error:', e));
        provider.on('end', e => {
            console.log('Websocket closed. Attempting to reconnect...'); // @@@ TODO improve this
            provider = new Web3.providers.WebsocketProvider(subscriptionNetwork.websocketUrl);

            provider.on('connect', function () {
                console.log('Websocket reconnected');
            });
            
            web3.setProvider(provider);
        });
        provider.on('connect', function () {
            console.log('Websocket Connected');
        });
        
        // Get past logs (only once), uses the metamask provider
        if(this.state.courses.length == 0) {
            this.getPastLogs();
        }

        // Get newBlockHeaders
        this.blocksSubscription = web3.eth.subscribe('newBlockHeaders', (error, result) => {
            if(!error) {
                console.log(result);
                this.setState({ block: result.number});
            } else {
                console.log('Error:', error);          
            }
        }).on("error", function(error) {
            console.log('error in newBlockHeaders', error);
        });
        // Returns single object:
        // difficulty:"2"
        // extraData:"0xd88301080f846765746888676f312e31302e34856c696e75780000000000000021875480dda79945988b974048a8643c8d423eafc84a45c9b331f0d9961971f115f7b10ac493f8602405ea9e7a0107151f4fee2f4dd0144e6a0c3a7afa88dfd000"
        // gasLimit:7006834
        // gasUsed:1134759
        // hash:"0xd95f64af2f228d63af1613edafb70588d04042230e49a3f57dfbc4d9336c2f72"
        // logsBloom:"0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000400000010000000000000000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000810000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"
        // miner:"0x0000000000000000000000000000000000000000"
        // mixHash:"0x0000000000000000000000000000000000000000000000000000000000000000"
        // nonce:"0x0000000000000000"
        // number:2914450
        // parentHash:"0xa3298356d8501f969ee9362993b0ba82d5c2f2cca248ebd3abea7a47a88d54de"
        // receiptsRoot:"0xa41d232ef07c14323d8c645c76a8a5822c2e53b34ad9caeb60e657c5cec9d8cc"
        // sha3Uncles:"0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347"
        // size:undefined
        // stateRoot:"0x4eea19c633477440ea19dea36fb61da9831dc1b6b76cbbdae49477a3db9359aa"
        // timestamp:1535786995
        // transactionsRoot:"0xeaceb3e3be076da8b37b77593b0c9e293af717e36d3e65dbfc7d8207dd4de2dd"
        
        // Get logs for specific topics
        this.logsSubscription = web3.eth.subscribe('logs', {
            fromBlock: "0x" + Number(FROM_BLOCK).toString(16),
            //address: "0xB90761cFb3f327F901024668CD2Eb73A191F06aA",
            topics: ['0x0314a863b2e94adb6cd6b5a2e580b6c339838ac7a670b298d8eab29a01df03a8', null], // this is the Created event of the Course contract
        }, (error, result) => {
            if(!error) {
                const eventAbi = getEventAbi(CourseABI, 'Created');
                const data = result.data;
                const topics = result.topics;
                const decodedEvent = web3.eth.abi.decodeLog(eventAbi, data, topics);
                // {0: "Test1", 1: "Bob", name: "Test1", instructor: "Bob"}
                console.log('logs result', result, decodedEvent);
                
            } else {
                console.log('Error:', error);          
            }
        });

        // Returns single transaction:
        // address:"0xc7d3F873910E5c3cD0A53670B3ac9332dfAeE284"
        // blockHash:"0xc4e8c72b119f683fd8954599fea830dc6caa41e26c8f0a04914f41cebd22bb66"
        // blockNumber:2914481
        // data:"0x00000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000554657374310000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000003426f620000000000000000000000000000000000000000000000000000000000"
        // id:"log_998b47d5"
        // logIndex:4
        // removed:false
        // topics: [
        //     0:"0x0314a863b2e94adb6cd6b5a2e580b6c339838ac7a670b298d8eab29a01df03a8"
        //     1:"0xd283f3979d00cb5493f2da07819695bc299fba34aa6e0bacb484fe07a2fc0ae0"
        // ]
        // length:2
        // transactionHash:"0x9116cfe944f0d89f304d00496e1dc0470009df86be57e9f1cf4c044020563808"
        // transactionIndex:4




        // const data = '0x00000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000554657374310000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000003426f620000000000000000000000000000000000000000000000000000000000';
        // const topics = ['0x0314a863b2e94adb6cd6b5a2e580b6c339838ac7a670b298d8eab29a01df03a8', "0xd283f3979d00cb5493f2da07819695bc299fba34aa6e0bacb484fe07a2fc0ae0"];
        
    }

    componentWillUnmount() {
        this.blocksSubscription.unsubscribe(function(error, success){
            if(error) {
                console.log('Error while unsubscribing from "newBlockHeaders": ', error);
            } else {
                console.log('Unsubscribing from "newBlockHeaders": ', success);
            }
        });
        this.logsSubscription.unsubscribe(function(error, success){
            if(error) {
                console.log('Error while unsubscribing from "logs": ', error);
            } else {
                console.log('Unsubscribing from "logs": ', success);
            }
        });
    }
    
    getPastLogs = async () => {
        if (this.state.courses.length == 0) {
            try {
                // this uses the web3 provider passed in from web3-info, so MM

                // Get course addresses from AtAdress event
                let eventAbi = getEventAbi(SchoolABI, 'AtAdress');
                const addresses = [];
                const courseAddresses = await this.props.web3.eth.getPastLogs({
                    fromBlock: "0x" + Number(FROM_BLOCK).toString(16),
                    address: "0x9C4863391838293b1cF042850F6484f92121f7b7", // school contract
                    topics: ["0x78e5c07b8ab39db26099db8a63304491745498993e186895c0e5fe427c87deca"]                    
                });
                for(const addr of courseAddresses) {
                    const decodedEvent = web3.eth.abi.decodeLog(eventAbi, addr.data, addr.topics);
                    addresses.push(decodedEvent.loc);
                }

                // Get course creation events
                eventAbi = getEventAbi(CourseABI, 'Created');
                const courses = {};
                let pastLogs = await this.props.web3.eth.getPastLogs({
                    fromBlock: "0x" + Number(FROM_BLOCK).toString(16),
                    topics: ['0x0314a863b2e94adb6cd6b5a2e580b6c339838ac7a670b298d8eab29a01df03a8', null],
                });
                for(const res of pastLogs) {
                    const decodedEvent = web3.eth.abi.decodeLog(eventAbi, res.data, res.topics);
                    if(addresses.indexOf(res.address) >= 0) {
                        courses[res.address] = { address:res.address, name:decodedEvent.name, instructor:decodedEvent.instructor};
                    }
                }

                // Get course update events
                eventAbi = getEventAbi(CourseABI, 'Updated');
                pastLogs = await this.props.web3.eth.getPastLogs({
                    fromBlock: "0x" + Number(FROM_BLOCK).toString(16),
                    topics: ['0xd5b4bc30e7c67b0b9955fa3f7566c8873e7b39606da4cafb1235c0b96f8a3840'],
                });
                pastLogs = _.sortBy(pastLogs, 'blockNumber'); // make we apply changes in the right order
                for(const res of pastLogs) {
                    const decodedEvent = web3.eth.abi.decodeLog(eventAbi, res.data, res.topics);
                    //console.log('Update', res.address, decodedEvent.name, decodedEvent.instructor);
                    if(addresses.indexOf(res.address) >= 0) {
                        courses[res.address] = { address:res.address, name:decodedEvent.name, instructor:decodedEvent.instructor};
                    }
                }
                
                this.setState({ courses });
                console.log('courses from pastLogs', courses);
            } catch(error) {
                console.log('pastLogs error', error);
            }
        }

        // Returns array of transactions:
        // address:"0x091A02BF0C25B519b0B4E99cfAd72Aa3c07362B3"
        // blockHash:"0xc62914abe38b13c2a313534ce062cf5e5cce50db3a52eab510fe1882edcdd6b7"
        // blockNumber:2864371
        // data:"0x000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000007455448203130310000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000045374616e00000000000000000000000000000000000000000000000000000000"
        // id:"log_f112fdb8"
        // logIndex:6
        // removed:false
        // topics: [
        //           0:"0x0314a863b2e94adb6cd6b5a2e580b6c339838ac7a670b298d8eab29a01df03a8"
        //           1:"0xa089d35ebaa48c1120412580bc3d366c8652b094a8daba79723d50d438816b25"
        // ]
        // length:2
        // transactionHash:"0xfcde462033a033a78757233a5be2ca331dcf74a812c8825fdcb5f75f632ad1cb"
        // transactionIndex:7
    }
    
    render() {
        const { block } = this.state;
        const href = `${subscriptionNetwork.etherscanUrl}/block/${block}`;
        return (
            <div>{subscriptionNetwork.shortName} Current Block: {block ? <a href={href} target="_blank">{block}</a> : <Loader active size="tiny" inline />}</div>
        );
    }
};

Subscribe.propTypes = {
    // @@@ todo add after refactoring web3-provider props
};


// async function queryInfo() {
//     const lastBlock = await web3.eth.getBlockNumber();
//     console.log("lastBlock: ", lastBlock)
// 
//     const getProtocolVersion = await web3.eth.getProtocolVersion();
//     console.log("protocolVersion: ", hashRate)
// 
//     const gasPrice = await web3.eth.getGasPrice();
//     console.log("getGasPrice: ", gasPrice)
// }
// 
// async function queryBlockInfo(blockNum) {
//     const info = await web3.eth.getBlock(blockNum, true);
//     console.log(`queryBlockInfo ${blockNum}: `, JSON.stringify(info))
//     return info
// }
// 
// async function queryTransactionInfo(txHash) {
//     const info = await web3.eth.getTransaction(txHash);
//     console.log(`tx info ${txHash}: `, info)
//     return info;
// }
// 
// async function queryTransactionReceipt(txHash) {
//     const info = await web3.eth.getTransactionReceipt(txHash);
//     console.log(`tx receipt ${txHash}: `, info)
//     return info;
// }
// 
// async function queryAddressBalance(addr) {
//     const balance = await web3.eth.getBalance(addr);
//     console.log(`balance ${addr}: ${balance} Eth`)
//     return balance
// }
// 
// async function queryPassLogs(options = {
//     //fromBlock, // hex
//     //toBlock, // hex
//     //address,
//     //topics
// }) {
//     try {
//         const logs = await web3.eth.getPastLogs(options);
//         console.log(`logs :`, logs)
//     }
//     catch (ex) {
//         console.log(ex)
//     }
// }
// 
// async function subscribeTopic(name) {
//     const topic = await web3.eth.subscribe(name)
// 
//     topic.on("data", function (transaction) {
//         console.log(transaction);
//     });
// 
//     return topic;
// }
// 
// async function subscribeLogs(options = {}) {
//     try {
//         const topic = await web3.eth.subscribe('logs', options)
// 
//         topic.on("data", function (transaction) {
//             console.log(transaction);
//         });
// 
//         return topic;
//     } catch (error) {
//         console.log(error)
//     }
// }
// 
// // queryBlockInfo(2205747);
// // queryAddressBalance('0xb279182d99e65703f0076e4812653aab85fca0f0')
// // queryTransactionInfo('0xf1b24f829e7cee3fd3193009c14841f53acb0b4e2755422a0a9b2e041c2b6313');
// // queryTransactionReceipt('0xf1b24f829e7cee3fd3193009c14841f53acb0b4e2755422a0a9b2e041c2b6313');
// 
// queryPassLogs({`
//     address: "0xe62d7ec4339d581543da8322889a0e92b5af7617",
//                fromBlock: '0x' + Number(2158915).toString(16),
//                topics: []
// })
// 
// 
// // const topic = subscribeTopic('newBlockHeaders'); // pendingTransactions
// // topic.then(res => {
// //     setTimeout(_ => {
// //         console.log('unsub')
// //         res.unsubscribe();
// //     }, 20000)
// // })
// 
// // subscribeLogs({
// //     address: '0xE62d7Ec4339D581543da8322889a0e92B5aF7617',
// //     topics: null,
// //     fromBlock: 200
// // });
