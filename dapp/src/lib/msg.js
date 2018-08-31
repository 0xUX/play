import React, { Component } from "react";
import PropTypes from 'prop-types';
import { Message, Button, Modal, Form } from 'semantic-ui-react';

export function Msg(props) {
    if(!props.msg) return null;
    return (
        <Message negative={props.negative} positive={props.positive} warning={props.warning} info={props.info} >
            <Message.Header>{props.head}</Message.Header>
            <div style={{overflowX: 'auto' }}>{props.msg}</div>
        </Message>
    );
}

Msg.propTypes = {
    head: PropTypes.string,
    msg: PropTypes.string
};


export class ConfirmModal extends Component {
    state = { open: false }
    close = () => this.setState({ open: false })
    show = () => this.setState({ open: true });
    
    render() {
        const { onConfirm, size, header, content, buttonTxt, buttonColor, buttonSize, buttonCompact, contract } = this.props;
        const { open } = this.state;
        
        return (
            <div>
                <Button onClick={this.show} size={buttonSize} color={buttonColor} compact={buttonCompact} >{buttonTxt}</Button>
                <Modal size={size} open={open} onClose={this.close}>
                    <Modal.Header>{header}</Modal.Header>
                    <Modal.Content>
                        <p>{content}</p>
                    </Modal.Content>
                    <Modal.Actions>
                        <Button positive onClick={this.close}>No</Button>
                        <Button negative onClick={() => {this.close(); onConfirm(contract);}} icon='checkmark' labelPosition='right' content='Yes' />
                    </Modal.Actions>
                </Modal>
            </div>
        );
    }
};

ConfirmModal.defaultProps = {
    size: 'mini',
    buttonSize: 'small',
    buttonColor: null,
    buttonCompact: null
};

ConfirmModal.propTypes = {
    header: PropTypes.string.isRequired,
    content: PropTypes.node.isRequired,
    onConfirm: PropTypes.func.isRequired,
    size: PropTypes.string,
    buttonSize: PropTypes.string,
    buttonTxt: PropTypes.string.isRequired,
    buttonColor: PropTypes.string,
    buttonCompact: PropTypes.bool,
    contract: PropTypes.object.isRequired
};

export class SetInstructorModal extends Component {
    state = {
        open: false,
        instructor: ''
    }
    close = () => this.setState({ open: false, instructor: '' })
    show = () => this.setState({ open: true });

    handleChange = (e) => {
        const value = e.target.value;
        this.setState({ instructor:value });
    }
    
    render() {
        const { onUpdate, size, header, content, buttonTxt, buttonColor, buttonSize, buttonCompact, contract } = this.props;
        const { open } = this.state;
        
        return (
            <React.Fragment>
                <Button onClick={this.show} size={buttonSize} color={buttonColor} compact={buttonCompact} >{buttonTxt}</Button>
                <Modal size={size} open={open} onClose={this.close}>
                    <Modal.Header>{header}</Modal.Header>
                    <Modal.Content>
                        <p>{content}</p>
                        <Form id="Form" onSubmit={() => {this.close(); onUpdate(contract, this.state.instructor);}}>
                            <Form.Field required>
                                <label>Instructor</label>
                                <Form.Input placeholder='Instructor'
                                            value={this.state.instructor}
                                            onChange={this.handleChange}
                                            name="instructor" />
                            </Form.Field>
                        </Form>
                    </Modal.Content>
                    <Modal.Actions>
                        <Button onClick={this.close}>Cancel</Button>
                        <Button positive type="submit" content='Update' form="Form" />
                    </Modal.Actions>
                </Modal>
            </React.Fragment>
        );
    }
};

SetInstructorModal.defaultProps = {
    size: 'small',
    buttonSize: 'mini',
    buttonColor: null,
    buttonCompact: true
};

SetInstructorModal.propTypes = {
    header: PropTypes.string.isRequired,
    content: PropTypes.node.isRequired,
    onUpdate: PropTypes.func.isRequired,
    size: PropTypes.string,
    buttonSize: PropTypes.string,
    buttonTxt: PropTypes.string.isRequired,
    buttonColor: PropTypes.string,
    buttonCompact: PropTypes.bool,
    contract: PropTypes.object.isRequired
};
