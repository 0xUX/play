import React, { Component } from "react";
import { Grid, Segment } from 'semantic-ui-react';
import { withWeb3 } from './web3-provider';
import Subscribe from './subscription';

class Web3Info extends Component {
    
    
    render() {
        const { web3 } = this.props; // from web3-provider

        return (
            <div>
                <Grid  container stackable>
                    <Grid.Row>
                        <Grid.Column>
                            <Segment><Subscribe web3={web3} /></Segment>
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
