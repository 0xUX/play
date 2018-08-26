import React, { Component } from "react";
import _ from 'lodash-es';
import {hot} from "react-hot-loader";
import { Container, Header, Icon } from 'semantic-ui-react';
import Web3Provider from './components/web3-provider';
import Web3Info from './components/web3-info';
import Web3Ready from './components/web3-ready';

import './css/app.css';

class App extends Component {    
    render() {        
        return (
            <Container style={{ padding: '3em 0em' }}>
                <Web3Provider defaultWeb3Provider="http://localhost:9545">                    
                    <Header as='h2' icon textAlign='center'>
                        <Icon name='ethereum' circular />
                        <Header.Content>Web3 playground</Header.Content>
                    </Header>
                    <Web3Ready>
                        <Web3Info />
                    </Web3Ready>
                </Web3Provider>
            </Container>
        );
    }
}

export default hot(module)(App);
