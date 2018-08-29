require('events').EventEmitter.defaultMaxListeners = 0; // suppress warning, is bug in this web3 version (1.0.0-beta.26)
const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const provider = ganache.provider();
const web3 = new Web3(provider);

const compiledCourse = require('../build/Course.json');
const compiledSchool = require('../build/School.json');

let accounts;
let school;
let courseAddress;
let course;

const NAME = 'BTC 101';
const INSTRUCTOR = 'Mark';

beforeEach(async () => {
    
    accounts = await web3.eth.getAccounts();
    
    school = await new web3.eth.Contract(JSON.parse(compiledSchool.interface))
                           .deploy({ data: compiledSchool.bytecode })
                           .send({ from: accounts[0], gas: '3000000' });
        
    // The school contract creates a Course contract and triggers the 'AtAdress' event
    await school.methods.newCourse(NAME, INSTRUCTOR).send({
        from: accounts[0], gas: '3000000'
    });

    // Get the address of the deployed Course contract
    [courseAddress] = await school.methods.getContracts().call();
    
    // get JS model/interface of this contract (already deployed in previous step)
    course = await new web3.eth.Contract(
        JSON.parse(compiledCourse.interface),
        courseAddress
    );
});

describe('Course', () => {
    it('school instance was deployed', () => {
        assert.ok(school.options.address);
    });
    
    it('course instance was deployed', () => {
        assert.ok(course.options.address);
    });
    
    it('school "AtAddress" event was emitted and equal to call result', async () => {
        const events = await school.getPastEvents('AtAdress');
        const addressFromEvent = events[0].returnValues['loc'];
        assert.equal(courseAddress, addressFromEvent);
    });

    it('SKIPPED: course "Created" event was emitted and equal to call result', async () => {
        assert(true); // See https://github.com/ethereum/web3.js/pull/1626 @@@@@@@@@@@@@@@@
        // const events = await course.getPastEvents('Created');
        // const addressFromEvent = events[0].returnValues['loc'];
        // assert.equal(courseAddress, addressFromEvent);
    });
    
    it('course instance has the correct owner, name, and instructor', async () => {
        const { _name, _instructor } = await course.methods.info().call();
        assert.equal(_name, NAME);
        assert.equal(_instructor, INSTRUCTOR);
        const owner = await course.methods.contract_owner().call();
        assert.equal(owner, accounts[0]);
    });
    
    it('course instructor can be updated by owner and "Update" event was emitted', async () => {
        const NEW_INSTRUCTOR = 'Stan';
        await course.methods.setInstructor(NEW_INSTRUCTOR).send({
            from: accounts[0]
        });
        
        const instructor = await course.methods.instructor().call();
        assert.equal(instructor, NEW_INSTRUCTOR);
        
        const events = await course.getPastEvents('Updated');
        const instructorFromEvent = events[0].returnValues['instructor'];
        assert.equal(instructorFromEvent, NEW_INSTRUCTOR);

    });
    
    it('course non-owner can not kill the contract', async () => {
        try {
            await course.methods.exit().send({
                from: accounts[1]
            });
            assert(false);
        } catch(error) {
            if(error.message == 'VM Exception while processing transaction: revert not authorized.') {
                assert(true);
            } else {
                assert(false);
            }                
        }
    });
    
    it('course owner killed the contract', async () => {
        await course.methods.exit().send({
            from: accounts[0]
        });

        // Try to make a simple call
        try {
            await course.methods.name().call();
            assert(false);
        } catch(error) {
            assert(true);                
        }
    });
});
