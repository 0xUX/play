import React from "react";
import PropTypes from 'prop-types';
import { Message } from 'semantic-ui-react';

export function Msg(props) {
    if(!props.msg) return null;
    return (
        <Message negative={props.negative} positive={props.positive} warning={props.warning} info={props.info} >
            <Message.Header>{props.head}</Message.Header>
            <p>{props.msg}</p>
        </Message>
    );
}

Msg.propTypes = {
    head: PropTypes.string,
    msg: PropTypes.string
};
