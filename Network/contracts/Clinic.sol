// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./IDIDRegistry.sol";
import "./IClinic.sol";

contract Clinic is IClinic {
    address public owner;
    IDIDRegistry public didRegistry;
    mapping(address => bool) private doctors;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only clinic owner can perform this action");
        _;
    }

    constructor(address _didRegistry, address _owner) {
        owner = _owner;
        didRegistry = IDIDRegistry(_didRegistry);
    }

    function registerDoctor(address doctor) external onlyOwner {
        require(!doctors[doctor], "Doctor is already registered");
        doctors[doctor] = true;
    }

    function removeDoctor(address doctor) external onlyOwner {
        require(doctors[doctor], "Doctor is not registered");
        doctors[doctor] = false;
    }

    function isDoctorRegistered(address doctor) external view override returns (bool) {
        return doctors[doctor];
    }
}
