// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./DIDRegistry.sol";
import "./Clinic.sol";
import "./MedicalCard.sol";

contract ContractFactory {
    IDIDRegistry public didRegistry;

    mapping(address => address) public deployedMedicalCards;
    mapping(address => bool) public allowedClinicDeployers; 
    mapping(address => address) public deployedClinics;

    event MedicalCardDeployed(address indexed owner, address medicalCardAddress);
    event ClinicDeployed(address indexed owner, address clinicAddress);

    constructor(address _didRegistry) {
        didRegistry = IDIDRegistry(_didRegistry);
    }

    function deployMedicalCard(string memory ownerDID) external {
        require(didRegistry.resolveDID(ownerDID) == msg.sender, "Access denied");
        MedicalCard newMedicalCard = new MedicalCard(address(didRegistry), ownerDID);
        deployedMedicalCards[msg.sender] = address(newMedicalCard);
        emit MedicalCardDeployed(msg.sender, address(newMedicalCard));
    }

    function deployClinic(address clinicOwner) external {
        Clinic newClinic = new Clinic(address(didRegistry), clinicOwner);
        deployedClinics[msg.sender] = address(newClinic);
        emit ClinicDeployed(msg.sender, address(newClinic));
    }
}
