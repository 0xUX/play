import React, { Component } from "react";
import { Message, Icon, Grid, Segment, Loader } from 'semantic-ui-react';
import { withWeb3 } from './web3-provider';
import { Subscribe } from './subscription';

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
    };

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
        <Message icon color={msg.icon=="warning" ? 'red' : 'olive' }>
            <Icon name={msg.icon} loading={msg.loading} />
            <Message.Content>
                <Message.Header>{msg.header}</Message.Header>
                <p>{msg.body}</p>
            </Message.Content>
        </Message>
    );
}

class Web3Info extends Component {
    state = {
        pastLogs: []
    }
    
    getPastLogs = async () => {
        if (this.state.pastLogs.length == 0) {
            try {
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
        const { web3, web3State, currentProvider, accounts, network, error } = this.props;

        let subscription = <Loader active inline="centered" content='Loading' />;
        if(accounts.length) {           
            subscription = <Subscribe web3={web3} getPastLogs={this.getPastLogs} pastLogs={this.state.pastLogs} />;
            // new block? show! => get all new logged events? @@@
        }
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
            <Grid  container stackable>
                <Grid.Row>
                    <Grid.Column>
                        <Segment>{subscription}</Segment>
                    </Grid.Column>
                </Grid.Row>
                <Grid.Row columns={3}>
                    <Grid.Column>
                        <Segment>Content</Segment>
                    </Grid.Column>
                    <Grid.Column>
                        <Segment>Content</Segment>
                    </Grid.Column>
                    <Grid.Column>
                        <Segment>Content</Segment>
                    </Grid.Column>
                </Grid.Row>
                <Grid.Row columns={2}>
                    <Grid.Column>
                        <Segment>Content</Segment>
                    </Grid.Column>
                    <Grid.Column>
                        <Segment>Content</Segment>
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        </div>
        );
    }
}


export default withWeb3(Web3Info);
