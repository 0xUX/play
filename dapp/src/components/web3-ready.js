import React, { Component } from "react";
import PropTypes from 'prop-types';
import { Message, Icon } from 'semantic-ui-react';
import { withWeb3 } from './web3-provider';

function Msg(props) {
    const { web3, web3State, currentProvider, accounts, network, error } = props;

    let status = 'isLoading';
    
    // Evaluate withWeb3 state
    if(web3State.isConnected) {
        status = 'isConnected';
    } else if(web3State.isLoading) {
        status = 'isLoading';
    } else if(web3State.error) {
        status = 'connectionError';
    } else {
        status = 'noProvider';
    }

    // When connected evaluate state from web3
    if(web3State.isConnected && web3) {
        if(web3.currentProvider) { status = 'gotProvider'; }
        if(web3.currentProvider.isMetaMask) { status = 'gotMetaMask'; }
        if(web3.currentProvider && accounts.length) { status = 'ready'; }
        if(error) { status = 'web3Error'; }
    };

    
    const msgs = {
        isLoading: {
            header: 'Loading Ethereum provider',
            body: <span>Checking if your browser has the <a href="https://metamask.io/">MetaMask</a> extension installed...</span>,
            icon: 'asterisk',
            loading: true
        },
        noProvider: {
            header: 'No Ethereum provider found',
            body: <span>Your need to install the <a href="https://metamask.io/">MetaMask</a> extension to be able to use this application.</span>,
            icon: 'asterisk',
            loading: false
        },
        gotProvider: {
            header: 'Found a provider',
            body: `Found provider "${currentProvider}". This is not supported for now, please use MetaMask.`,
            icon: 'warning',
            loading: false
        },
        gotMetaMask: {
            header: 'MetaMask is installed',
            body: 'Your browser has MetaMask installed, but no account was found. Make sure you have set up and unlocked MetaMask',
            icon: 'warning',
            loading: false
        },
        ready: {
            header: 'MetaMask is ready to go',
            body: <span>Your browser has MetaMask installed, is connected to the <a href={network.etherscanUrl} target="_blank">{network.name}</a> network and has account address: {accounts[0]}.</span>,
            icon: 'check circle outline',
            loading: false
        },
        connectionError: {
            header: 'RPC fallback failed',
            body: String(web3State.error),
            icon: 'warning',
            loading: false
        },
        web3Error: {
            header: 'Something went wrong',
            body: String(error),
            icon: 'warning',
            loading: false
        }
    };

    const msg = msgs[status];
    
    return (
        <Message icon={!!msg.icon} color={msg.icon=="warning" ? 'red' : 'olive' }>
            <Icon name={msg.icon} loading={msg.loading} />
            <Message.Content>
                <Message.Header>{msg.header}</Message.Header>
                <p>{msg.body}</p>
            </Message.Content>
        </Message>
    );
}

Msg.propTypes = {
    accounts: PropTypes.array.isRequired,
    // @@@ todo add after refactoring web3-provider props
};

function Web3Ready(props) {
    const { web3, web3State, currentProvider, accounts, network, error } = props; // from the web3-provider
        
        return (
            <div>
                <Msg
                    web3={web3}
                    web3State={web3State}
                    currentProvider={currentProvider}
                    accounts={accounts}
                    network={network}
                    error={error}
                />
                {accounts.length > 0 && props.children}
            </div>
        );
}

Web3Ready.propTypes = {
    accounts: PropTypes.array.isRequired,
    // @@@ todo add after refactoring web3-provider props
};

export default withWeb3(Web3Ready);
