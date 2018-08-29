pragma solidity ^0.4.24;

contract Course {
    event Created (
        string name,
        string indexed iname,
        string instructor
    );
    event Updated (
        string name,
        string instructor
    );

    string public name;
    string public instructor;
    address public contract_owner;

    modifier ownerOnly() {
        require(msg.sender == contract_owner, "not authorized.");
        // only contract owner is allowed to call this
        _;
    }
    
    constructor(address _owner, string _name, string _instructor) public {
        contract_owner = _owner;
        name = _name;
        instructor = _instructor;
        emit Created(_name, _name, _instructor);
    }
    
    function setInstructor(string _instructor) external ownerOnly {
        instructor = _instructor;
        emit Updated(name, _instructor);
    }

    function info() external view returns(string _instructor, string _name) {
        _name = name;
        _instructor = instructor;
    }

    function exit() external ownerOnly {
        selfdestruct(contract_owner);
    }
}

contract School {
    event AtAdress(
        address loc,
        string name
    );

    address[] all_contracts;

    function newCourse(string name, string instructor) public {
        address addr = new Course(msg.sender, name, instructor);
        all_contracts.push(addr);
        emit AtAdress(addr, name);
    }
    
    function getContracts() external view returns (address[] all) {
        all = all_contracts;
    }
}
