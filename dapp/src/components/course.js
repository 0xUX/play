import React, { Component } from "react";
import PropTypes from 'prop-types';
import { Segment, Loader, Form, Button, Header, List, Dimmer } from 'semantic-ui-react';
import { Msg, ConfirmModal, SetInstructorModal } from '../lib/msg';

export class CreateCourseForm extends Component {
    state = {
        name: '',
        instructor: '',
        invalid: { // used for client side errors
            name: true,
            instructor: true
        },
        submitStatus: 'disabled',
        error: null // used for remote errors
    }

    updateButtonState = () => {
        const { invalid } = this.state;
        const allGood = Object.keys(invalid).every(k => invalid[k] === false);
        this.setState({ submitStatus: allGood ? '' : 'disabled' });
    }
    
    handleChange = (e) => {
        const name = e.target.name;
        const value = e.target.value;
        this.setState({ [name]:value });

        // validate (these validations should also exist inside the contract)
        if(name == 'name') {
            const newState = (value.length < 3 || value.length > 32) ? 'The course name should be between 3 and 32 characters long.' : false;
            this.setState(prevState => (
                { invalid: { ...prevState.invalid, name: newState}}
            ), this.updateButtonState);
        }
        if(name == 'instructor') {
            const newState = (value.length < 3 || value.length > 32) ? 'The instructor name should be between 3 and 32 characters long.' : false;
            this.setState(prevState => (
                { invalid: { ...prevState.invalid, instructor: newState}}
            ), this.updateButtonState);
        }
    }
    
    handleSubmit = async (e) => {
        e.preventDefault();
        const { invalid, name, instructor } = this.state;
        
        if (!Object.keys(invalid).every(k => invalid[k] === false)) return;

        this.setState({ submitStatus: 'loading', error: null });
        
        try {
            await this.props.createNewCourse(name, instructor);
            this.setState({ name: '', instructor: '' });
        } catch(error) {
            this.setState({ error: String(error) });
        }

        this.updateButtonState();
    }

    showInputError = (name) => {
        const state = this.state.invalid[name];
        const notEmpty = this.state[name].length > 0;
        return state && notEmpty;
    }
    
    render() {
        const { submitStatus, error } = this.state;
        
        return (
            <div>
                <Header as='h2'>Create New Course</Header>
                <Msg msg={error} head="Error" negative />
                <Form onSubmit={this.handleSubmit}>
                    <Form.Field required>
                        <label>Course Name</label>
                        <Form.Input placeholder='Course Name'
                                    value={this.state.name}
                                    onChange={this.handleChange}
                                    name="name"
                                    readOnly={submitStatus=='loading'}
                                    error={this.showInputError('name')} />
                    </Form.Field>
                    <Form.Field required>
                        <label>Instructor</label>
                        <Form.Input placeholder='Instructor'
                                    value={this.state.instructor}
                                    onChange={this.handleChange}
                                    name="instructor"
                                    readOnly={submitStatus=='loading'}
                                    error={this.showInputError('instructor')} />
                    </Form.Field>
                    <Button type='submit'
                            disabled={submitStatus=='disabled'}
                            loading={submitStatus=='loading'} >Add</Button>
                </Form>
            </div>
        );
    }
}

CreateCourseForm.propTypes = {
    createNewCourse: PropTypes.func.isRequired
};

function CourseItem(props) {
    const { address, course, network, accounts, killContract, setInstructor } = props;
    
    const href = `${network.etherscanUrl}/address/${course.address}`;
    let title = course.name;
    let description = `Instructor: ${course.instructor}`;
    let loading = false;
    let killButton = null;
    let setInstructorButton = null;            
    if(course.error) {
        title = "Error getting valid contract";
        description = String(course.error);
    } else if(course.loading) {
        description = course.loading;
        loading = true;
    } else if(course.owner == accounts[0]) {
        killButton = (
            <List.Content floated='right'>
                <ConfirmModal
                    buttonTxt="Kill"
                    onConfirm={killContract}
                    contract={course}
                    header="Self-destruct Contract"
                    content={`Are you sure you want to initiate self-destruction of the course "${title}"?`}
                />
            </List.Content>
        );
        setInstructorButton = (
            <SetInstructorModal
                buttonTxt="Change"
                onUpdate={setInstructor}
                contract={course}
                header="Update Instructor"
                content={`Change the instructor for the course "${title}":`}
            />
        );
    }        
    return (
        <List.Item>
            <Segment>
                <Dimmer active={loading} inverted>
                    <Loader />
                </Dimmer>
                {killButton}
                <List.Content>                        
                    <List.Header><a href={href} target="_blank">{title}</a></List.Header>
                    <List.Description>{description} {setInstructorButton}</List.Description>
                </List.Content>
            </Segment>
        </List.Item>
    );
}

CourseItem.propTypes = {
    address: PropTypes.string.isRequired,
    course: PropTypes.object.isRequired,
    network: PropTypes.object.isRequired,
    accounts: PropTypes.array.isRequired,
    killContract: PropTypes.func.isRequired,
    setInstructor: PropTypes.func.isRequired
};

export function CourseList(props) {
    const { accounts, network, courses, killContract, setInstructor, showDeadContracts } = props;

    let courseList = null;
    const courseItems = [];
    for (let address in courses) {
        if(showDeadContracts || !courses[address].error) {
            courseItems.push(
                <CourseItem
                    address={address}
                    course={courses[address]}
                    network={network}
                    accounts={accounts}
                    killContract={killContract}
                    setInstructor={setInstructor}
                    key={address}
                />
            );
        }
    }

    return courseItems.length ? <List relaxed>{courseItems}</List> : null;
}

CourseList.defaultProps = {
    showDeadContracts: true
};

CourseList.propTypes = {
    accounts: PropTypes.array.isRequired,
    network: PropTypes.object.isRequired,
    courses: PropTypes.object.isRequired,
    killContract: PropTypes.func.isRequired,
    setInstructor: PropTypes.func.isRequired,
    showDeadContracts: PropTypes.bool
};

