import React, { Component } from "react";
import PropTypes from 'prop-types';
import Web3 from 'web3'; // for subscriptions to work we need 1.0.0-beta.33 (so not the latest) see https://github.com/ethereum/web3.js/issues/1559 @@@
import { Loader } from 'semantic-ui-react';
import { networkDetails } from '../lib/network';

// @@@ TODO:
// - when user changes network on MM, do the same on Infura for subscriptions
// - https://web3js.readthedocs.io/en/1.0/web3-eth-subscribe.html#subscribe-syncing
// - combine logs found with getPastLogs and subscribe
// - error handling: each network error flow gets its own state

let subscriptionNetwork = networkDetails('rinkeby');
let web3;

export default class Subscribe extends Component {
    state = {
        block: 0,
        pastLogs: []
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

        // Get past logs (only once), uses the metamask provider
        if(this.state.pastLogs.length == 0) {
            this.getPastLogs();
        }

        // Get newBlockHeaders
        this.blocksSubscription = web3.eth.subscribe('newBlockHeaders', (error, result) => {
            if(!error) {
                //console.log(result);
                this.setState({ block: result.number});
            } else {
                console.log('Error:', error);          
            }
        }).on("data", function (transaction) {
            //console.log(transaction);
        });

        // Get logs for specific topics
        this.logsSubscription = web3.eth.subscribe('logs', {
            fromBlock: "0x0",
            //address: "0xB90761cFb3f327F901024668CD2Eb73A191F06aA",
            topics: ['0x0314a863b2e94adb6cd6b5a2e580b6c339838ac7a670b298d8eab29a01df03a8', null],            
        }, (error, result) => {
            if(!error) {
                console.log(result);
            } else {
                console.log('Error:', error);          
            }
        }).on("data", function (transaction) {
            console.log(transaction);
        });
    }

    componentWillUnmount() {
        this.blocksSubscription.unsubscribe(function(error, success){
            if(error)
                console.log('Error while unsubscribing from "newBlockHeaders": ', error);
        });
        this.logsSubscription.unsubscribe(function(error, success){
            if(error)
                console.log('Error while unsubscribing from "logs": ', error);
        });
    }
    
    getPastLogs = async () => {
        if (this.state.pastLogs.length == 0) {
            try {
                // this uses the web3 provider passed in from web3-info, so MM
                const pastLogs = await this.props.web3.eth.getPastLogs({
                    fromBlock: "0x0",
                    //address: "0xB90761cFb3f327F901024668CD2Eb73A191F06aA",
                    topics: ['0x0314a863b2e94adb6cd6b5a2e580b6c339838ac7a670b298d8eab29a01df03a8', null],
                    //topics: ["0x78e5c07b8ab39db26099db8a63304491745498993e186895c0e5fe427c87deca"]
                });
                this.setState({ pastLogs });
                console.log(pastLogs);
            } catch(error) {
                console.log(error);
            }
        }
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
