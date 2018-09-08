import React, { Component } from "react";
import PropTypes from 'prop-types';
import { Header, Checkbox } from 'semantic-ui-react';
import { withWeb3 } from './web3-provider';
import { Loader } from 'semantic-ui-react';
import { Msg } from '../lib/msg';
import { CourseList } from './course';


class School extends Component {
    state= {
        showDeadContracts: false
    }

    toggleHideShowContracts = () => {
        this.setState( { showDeadContracts: !this.state.showDeadContracts });
    }
    
    getCourseList = () => {
        const { accounts, loading, killContract, setInstructor, network, courses } = this.props;
        if(loading) return <Loader active inline="centered">Loading Courses</Loader>;
        return (
            <div>
              <Checkbox label="Show self-destructed contracts"
                        checked={this.state.showDeadContracts}
                        onChange={this.toggleHideShowContracts}
                        toggle />
              <CourseList
                accounts={accounts}
                network={network}
                courses={courses}
                killContract={killContract}
                setInstructor={setInstructor}
                showDeadContracts={this.state.showDeadContracts}
                />
            </div>
        );
    }
    
    getSchoolInfo = () => {
        const { schoolLoading, school, network } = this.props;
        if(schoolLoading) return <Loader active inline="centered">Loading School info</Loader>;
        let schoolInfo = <Msg msg="School contract not found, maybe you're on the wrong network?" warning />;
        if(Object.keys(school).length) {
            let schoolAddress = school.options.address;
            let schoolAddressUrl = `${network.etherscanUrl}/address/${schoolAddress}`;
            schoolInfo = (
                <div>
                    <p>School contract deployed at: <a href={schoolAddressUrl} target="_blank">{schoolAddress}</a></p>
                    {this.getCourseList()}
                </div>
            );
        }
        return schoolInfo;
    };

    render() {
        const { h3, error } = this.props;
        return (
            <div>
              <Header as='h2'>Courses at School</Header>
              <Header as='h3'>{h3}</Header>
              <Msg msg={error} head="Error" negative />
              {this.getSchoolInfo()}
            </div>
        );
    }
}

School.propTypes = {
    school: PropTypes.object.isRequired,
    schoolLoading: PropTypes.bool.isRequired,
    courses: PropTypes.object.isRequired,
    loading: PropTypes.bool.isRequired,
    setError: PropTypes.func.isRequired,
    error: PropTypes.string,
    setInstructor: PropTypes.func.isRequired,
    killContract: PropTypes.func.isRequired,
    accounts: PropTypes.array.isRequired,
    web3: PropTypes.object.isRequired,
    network: PropTypes.object.isRequired
};

export default withWeb3(School);
