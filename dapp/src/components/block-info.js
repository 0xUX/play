import React from 'react';
import PropTypes from 'prop-types';
import { Loader } from 'semantic-ui-react';
import { networkDetails } from '../lib/network';

let subscriptionNetwork = networkDetails('rinkeby');


function Block(props) {
    const { block, txt } = props;
    const href = `${subscriptionNetwork.etherscanUrl}/block/${block}`;
    const content = block ? <a href={href} target="_blank">{block}</a> : <Loader active size="tiny" inline />;    
    return (
        <div>
            {txt} Block on {subscriptionNetwork.shortName}: {content}
        </div>
    );
}

Block.propTypes = {
    block: PropTypes.number.isRequired
};

export const CurrentBlock = (props) => {
    return (
        <Block block={props.block} txt="Current" />
    );
}

export const LastRelevantBlock = (props) => {
    return (
        <Block block={props.block} txt="Last Relevant" />
    );
}
