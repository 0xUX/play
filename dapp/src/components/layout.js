import React, { Component } from "react";
import PropTypes from 'prop-types';
import { Grid, Segment } from 'semantic-ui-react';
import { withWeb3 } from './web3-provider';
import Subscribe from './subscription';
import School from './school';

class Layout extends Component {
    
    
    render() {
        const { web3 } = this.props; // from web3-provider

        return (
            <div>
                <Grid container stackable>
                    <Grid.Row columns={3}>
                        <Grid.Column>
                            <Segment><Subscribe web3={web3} /></Segment>
                        </Grid.Column>
                        <Grid.Column>
                            <Segment>Content</Segment>
                        </Grid.Column>
                        <Grid.Column>
                            <Segment>Content</Segment>
                        </Grid.Column>
                    </Grid.Row>
                    <Grid.Row>
                        <Grid.Column>
                            <Segment><School /></Segment>
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

Layout.propTypes = {
    // @@@ todo add after refactoring web3-provider props
};

export default withWeb3(Layout);
