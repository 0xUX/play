import React, { Component } from "react";
import {hot} from "react-hot-loader";
import { Container, Header, Icon } from 'semantic-ui-react';
import Web3Provider from './components/web3-provider';
import Web3Ready from './components/web3-ready';
import DataContainer from './components/container';

import './css/app.css';

//const RPC_FALLBACK_PROVIDER = 'https://rinkeby.infura.io/orDImgKRzwNrVCDrAk5Q';
const RPC_FALLBACK_PROVIDER = "http://localhost:9545";

class App extends Component {
    render() {        
        return (
            <Container style={{ padding: '3em 0em' }}>
                <Header as='h2' icon textAlign='center'>
                    <Icon name='ethereum' circular />
                    <Header.Content>Web3 playground</Header.Content>
                </Header>
                <Web3Provider defaultWeb3Provider={RPC_FALLBACK_PROVIDER}>
                    <Web3Ready>
                        <DataContainer />
                    </Web3Ready>
                </Web3Provider>
            </Container>
        );
    }
}

export default hot(module)(App);
