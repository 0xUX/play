import React, { Component } from "react";
import { Grid, Segment, Loader } from 'semantic-ui-react';
import { withWeb3 } from './web3-provider';
import School from '../contracts/school';

class School extends Component {
    state = {

    }
        
    render() {
        const { web3, accounts, network } = this.props; // from the web3-provider

        let school = <Loader active inline="centered" content='Loading' />;
        if(accounts.length) {
            school = <div>Have Accounts</div>;
        }
        return (
        <div>
            <Grid  container stackable>
                <Grid.Row>
                    <Grid.Column>
                        <Segment>{school}</Segment>
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        </div>
        );
    }
}


export default withWeb3(School);
