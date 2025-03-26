// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./IDIDRegistry.sol";
import "./IClinic.sol";

contract Clinic is IClinic {
    address public owner;
    IDIDRegistry public didRegistry;
    mapping(string => bool) private doctors;

    event DoctorRegistered(string indexed did, address indexed clinic);
    event DoctorRemoved(string indexed did, address indexed clinic);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only clinic owner can perform this action");
        _;
    }

    constructor(address _didRegistry) {
        owner = msg.sender;
        didRegistry = IDIDRegistry(_didRegistry);
    }

    function registerDoctor(string memory did) external onlyOwner {
        require(bytes(did).length > 0, "Invalid DID");
        require(!doctors[did], "Doctor is already registered");
        doctors[did] = true;
        emit DoctorRegistered(did, msg.sender);
    }

    function removeDoctor(string memory did) external onlyOwner {
        require(doctors[did], "Doctor is not registered");
        doctors[did] = false;
        emit DoctorRemoved(did, msg.sender);
    }

    function isDoctorRegistered(string memory did) external view override returns (bool) {
        return doctors[did];
    }
}
