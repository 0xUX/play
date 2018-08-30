import React, { Component } from "react";
import PropTypes from 'prop-types';
import { Grid, Segment, Loader, Form, Button, Header, List, Dimmer } from 'semantic-ui-react';
import { withWeb3 } from './web3-provider';
import { Msg, ConfirmModal } from '../lib/msg';
import SchoolContract from '../contracts/school';
import CourseContract from '../contracts/course';

class CreateCourseForm extends Component {
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
        const { accounts, school } = this.props;
        
        if (!Object.keys(invalid).every(k => invalid[k] === false)) return;

        this.setState({ submitStatus: 'loading' });
        
        try {
            await school.methods.newCourse(name, instructor).send({ from: accounts[0] });
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
                        <Form.Input placeholder='Course Name' value={this.state.name} onChange={this.handleChange} name="name" error={this.showInputError('name')} />
                    </Form.Field>
                    <Form.Field required>
                        <label>Instructor</label>
                        <Form.Input placeholder='Instructor' value={this.state.instructor} onChange={this.handleChange} name="instructor" error={this.showInputError('instructor')} />
                    </Form.Field>
                    <Button type='submit' disabled={submitStatus=='disabled'} loading={submitStatus=='loading'} >Add</Button>
                </Form>
            </div>
        );
    }
}

CreateCourseForm.propTypes = {
    accounts: PropTypes.array.isRequired,
    school: PropTypes.object.isRequired
};

class CourseItem extends Component {
    state = {

    };

    render() {
        const { address, courses, network, accounts, killContract, setInstructor } = this.props;
        
        let course = courses[address];
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
                <Button size="mini" compact onClick={setInstructor}>Change</Button>
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
}

function SchoolInfo(props) {
    const { web3, accounts, network, school, courses, error, killContract, setInstructor, loading } = props;
    
    let schoolInfo = <Msg msg="School contract not found, maybe you're on the wrong network?" warning />;
    if(school) {
        let schoolAddress = school.options.address;
        let schoolAddressUrl = `${network.etherscanUrl}/address/${schoolAddress}`;
        const courseItems = [];
        for (let address in courses) {
            courseItems.push(
                <CourseItem
                    address={address}
                    courses={courses}
                    network={network}
                    accounts={accounts}
                    killContract={killContract}
                    setInstructor={setInstructor}
                    key={address}
                />
            );
        };
        let courseList;
        if(loading) {
            courseList = <div><Loader active inline="centered" content={<span>Loading Courses<br /><br /></span>} /></div>;
        } else {
            courseList = courseItems.length ? <List relaxed>{courseItems}</List> : null;
        }
        schoolInfo = (
            <div>
                <p>School contract deployed at: <a href={schoolAddressUrl} target="_blank">{schoolAddress}</a></p>
                {courseList}
                <CreateCourseForm accounts={accounts} web3={web3} school={school} />
            </div>
        );
    }
    return schoolInfo;
}

SchoolInfo.propTypes = {
    accounts: PropTypes.array.isRequired,
    web3: PropTypes.object.isRequired
    // @@@ todo add after refactoring web3-provider props
};


class School extends Component {
    state = {
        school: null,
        courses: {},
        error: null,
        loading: false
    }

    async componentDidMount(){
        const { web3 } = this.props; // from the web3-provider

        this.setState({ loading: true });
        
        let school = null;
        // check if School contract is actually there (in case we're on another network)
        try {
            school = SchoolContract(web3);
            const code = await web3.eth.getCode(school.options.address);
            if (code == '0x') {
                school = null;
            } else {
                this.setState({ school });
            }
        } catch(error) {
            this.setState({ error });
        }
        
        // if the School contract exists
        if (school) {
            // get Course contracts
            let courseAdresses = null;
            try {
                courseAdresses = await school.methods.getContracts().call();
            } catch(error) {
                this.setState({ error });
            }

            if(courseAdresses) {
                try {
                    let courses = {};
                    await Promise.all(courseAdresses.map( async (address) => {
                        const course = CourseContract(web3, address);
                        try { // another try block because it otherwise messes up the whole loop
                            const info = await course.methods.info().call();
                            const { _name, _instructor } = info;
                            const owner = await course.methods.contract_owner().call();
                            courses[address] = {
                                address: address,
                                owner: owner,
                                name: _name,
                                instructor: _instructor                        
                            };         
                        } catch (error) {
                            if(String(error) == 'Error: ERROR: The returned value is not a convertible string:') {
                                // some bug in web 3, error should be something like "Attempting to run transaction which calls
                                // a contract function, but recipient address 0xc704aedd996be82cc460c9c774bb5aecf7ad4586 is not a contract address"
                                error = 'Contract has been self-destructed.';
                            }
                            courses[address] = {
                                address: address,
                                error: error
                            };              
                        }
                    }));
                    this.setState({ courses });
                } catch(error) {
                    this.setState({ error });
                }

                this.setState({ loading: false });
            }

            // subscribe to the event that is emitted when a new course is created
            // @@@ TODO think about if this is the best solution, race conditions?
            // @@@ alternative: at each new block => get all contracts since last block we checked

            // directly the returnValues??? contractInstance.events.eventName.returnValues;

            // const newCourse = await school.events.AtAdress();
            // newCourse.
            //     on('data', function(event){
            //         console.log(event); // same results as the optional callback above
            //     })
            //     .on('changed', function(event){
            //         // remove event from local database
            //     })
            //     .on('error', console.log('error'));
        }
    }

    killContract = async (contract) => {
        const { web3, accounts } = this.props;

        const address = contract.address;        
        const course = CourseContract(web3, address);
        let newState = {
            name: contract.name,
            instructor: contract.instructor,
            owner: contract.owner,
            loading: `${contract.name} (self-destruction in progress)`,
            address
        };
        this.setState(prevState => (
            { courses: { ...prevState.courses, [address]: newState}}
        ));

        try {
            await course.methods.exit().send({
                from: accounts[0]
            });
            // @@@ TODO
            // - signal somehow that courses list needs to be reloaded
        } catch(error) {
            // strip fluff
            error = String(error).replace('Error: Returned error: Error: ', '');
            // restore course in state
            delete newState.loading;
            this.setState(prevState => (
                { error, courses: { ...prevState.courses, [address]: newState}}
            ));            
        }
    }
    
    render() {
        const { web3, accounts, network } = this.props; // from the web3-provider
        const { school, courses, error, loading } = this.state;
        
        return (
            <div>
                <Header as='h2'>Courses at School</Header>
                <Msg msg={error} head="Error" negative />
                <SchoolInfo
                    web3={web3}
                    accounts={accounts}
                    network={network}
                    school={school}
                    courses={courses}
                    error={error}
                    killContract={this.killContract}
                    loading={loading}
                  />
            </div>
        );
    }
}

School.propTypes = {
    accounts: PropTypes.array.isRequired,
    web3: PropTypes.object.isRequired
    // @@@ todo add after refactoring web3-provider props
};

export default withWeb3(School);
