import React, { Component } from "react";
import PropTypes from 'prop-types';
import { Grid, Segment, Loader, Form, Button, Header, List } from 'semantic-ui-react';
import { withWeb3 } from './web3-provider';
import { Msg } from '../lib/msg';
import SchoolContract from '../contracts/school';
import CourseContract from '../contracts/course';

class CreateCourseForm extends Component {
    state = {
        name: '',
        instructor: '',
        error: null
    }

    render() {
        return (
            <div>
                <Header as='h2'>Create New Course</Header>
                <Form>
                    <Form.Field>
                        <label>Course Name</label>
                        <input placeholder='Course Name' />
                    </Form.Field>
                    <Form.Field>
                        <label>Instructor</label>
                        <input placeholder='Instructor' />
                    </Form.Field>
                    <Button type='submit'>Add</Button>
                </Form>
            </div>
        );
    }
}

function SchoolInfo(props) {
    const { web3, accounts, network, school, courses, error } = props;

    let schoolInfo = <Msg msg="School contract not found, maybe you're on the wrong network?" warning />;
    if(school) {
        let schoolAddress = school.options.address;
        let schoolAddressUrl = `${network.etherscanUrl}/address/${schoolAddress}`;
        let courseItems = courses.map( (course) => {
            const href = `${network.etherscanUrl}/address/${course.address}`;
            let title = course.name;
            let description = `Instructor: ${course.instructor}`;
            if(course.error) {
                title = "Error getting valid contract";
                description = String(course.error);
            }
            return (
                <List.Item key={course.address}>
                    <List.Icon name='angle double right' size='large' verticalAlign='middle' />
                    <List.Content>                        
                        <List.Header><a href={href} target="_blank">{title}</a></List.Header>
                        <List.Description>{description}</List.Description>
                    </List.Content>
                </List.Item>
            );
        });
        let courseList = courseItems.length ? <List divided relaxed>{courseItems}</List> : null;
        schoolInfo = (
            <div>
                <p>School contract deployed at: <a href={schoolAddressUrl} target="_blank">{schoolAddress}</a></p>
                {courseList}
                <CreateCourseForm />
            </div>
        );
    }
    return schoolInfo;
}

SchoolInfo.propTypes = {
    accounts: PropTypes.array.isRequired,
    // @@@ todo add after refactoring web3-provider props
};


class School extends Component {
    state = {
        school: null,
        courses: [],
        error: null
    }

    async componentDidMount(){
        const { web3 } = this.props; // from the web3-provider

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
                    const courses = await Promise.all(courseAdresses.map( async (address) => {
                        const course = CourseContract(web3, address);
                        try { // another try block because it otherwise messes up the whole loop
                            const name = await course.methods.name().call();
                            const instructor = await course.methods.instructor().call();
                            return {
                                address: address,
                                name: name,
                                instructor: instructor                        
                            };                            
                        } catch (error) {
                            return {
                                address: address,
                                error: error
                            };              
                        }
                    }));
                    this.setState({ courses });
                    console.log(courses);
                } catch(error) {
                    this.setState({ error });
                }
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
    
    render() {
        const { web3, accounts, network } = this.props; // from the web3-provider
        const { school, courses, error } = this.state;
        
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
                  />
            </div>
        );
    }
}

School.propTypes = {
    accounts: PropTypes.array.isRequired,
    // @@@ todo add after refactoring web3-provider props
};

export default withWeb3(School);
