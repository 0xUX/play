import React, { Component } from "react";
import PropTypes from 'prop-types';
import { Grid, Segment } from 'semantic-ui-react';
import { withWeb3 } from './web3-provider';
import School from './school';
import { CreateCourseForm } from './course';
import { CurrentBlock, LastRelevantBlock } from './block-info';

function Layout(props) {
        
    const { block,
            lastRelevantBlock,
            school,
            coursesFromLogs,
            coursesFromContract,
            coursesFromLogsLoading,
            coursesFromContractLoading,
            createNewCourse,
            ...rest
    } = props;

    const courseForm = Object.keys(school).length > 0 && <CreateCourseForm createNewCourse={createNewCourse} />;
    
    return (
        <div>
            <Grid container stackable>
                <Grid.Row columns={2}>
                    <Grid.Column>
                        <Segment><CurrentBlock block={block} /></Segment>
                    </Grid.Column>
                    <Grid.Column>
                        <Segment><LastRelevantBlock block={lastRelevantBlock} /></Segment>
                    </Grid.Column>
                </Grid.Row>
                <Grid.Row columns={2}>
                    <Grid.Column>
                        <Segment><School h3="Courses retrieved from event logs"
                                         school={school}
                                         courses={coursesFromLogs}
                                         loading={coursesFromLogsLoading}
                                         {...rest}
                            /></Segment>
                    </Grid.Column>
                    <Grid.Column>
                        <Segment><School h3="Courses retrieved from contract method call"
                                         school={school}
                                         courses={coursesFromContract}
                                         loading={coursesFromContractLoading}
                                         {...rest}
                            /></Segment>
                    </Grid.Column>
                </Grid.Row>
                <Grid.Row>
                    <Grid.Column>
                        <Segment>{courseForm}</Segment>
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        </div>
    );
}


Layout.propTypes = {
    block: PropTypes.number.isRequired,
    lastRelevantBlock: PropTypes.number.isRequired,
    school: PropTypes.object.isRequired,
    schoolLoading: PropTypes.bool.isRequired,
    setError: PropTypes.func.isRequired,
    error: PropTypes.string,
    coursesFromLogs: PropTypes.object.isRequired,
    coursesFromLogsLoading: PropTypes.bool.isRequired,
    coursesFromContract: PropTypes.object.isRequired,
    coursesFromContractLoading: PropTypes.bool.isRequired,
    createNewCourse: PropTypes.func.isRequired,
    setInstructor: PropTypes.func.isRequired,
    killContract: PropTypes.func.isRequired
};

export default Layout;
