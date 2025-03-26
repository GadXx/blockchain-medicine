// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./DIDRegistry.sol";
import "./Clinic.sol";
import "./MedicalCard.sol";

contract ContractFactory {
    address public owner;
    IDIDRegistry public didRegistry;

    mapping(address => address) public deployedMedicalCards;
    
    mapping(address => bool) public allowedClinicDeployers; 
    mapping(address => address) public deployedClinics;

    event MedicalCardDeployed(address indexed owner, address medicalCardAddress);
    event ClinicDeployed(address indexed owner, address clinicAddress);
    event ClinicDeployerAdded(address indexed deployer);
    event ClinicDeployerRemoved(address indexed deployer);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only factory owner can perform this action");
        _;
    }

    constructor(address _didRegistry) {
        owner = msg.sender;
        didRegistry = IDIDRegistry(_didRegistry);
    }

    function deployMedicalCard(string memory ownerDID) external returns (address) {
        require(deployedMedicalCards[msg.sender] == address(0), "Medical card already deployed");
        require(didRegistry.resolveDID(ownerDID) == msg.sender, "Access denied");
        MedicalCard newMedicalCard = new MedicalCard(address(didRegistry), ownerDID);
        deployedMedicalCards[msg.sender] = address(newMedicalCard);

        emit MedicalCardDeployed(msg.sender, address(newMedicalCard));
        return address(newMedicalCard);
    }

    function deployClinic() external returns (address) {
        require(allowedClinicDeployers[msg.sender], "Not allowed to deploy clinics");

        Clinic newClinic = new Clinic(address(didRegistry));
        deployedClinics[msg.sender] = address(newClinic);

        emit ClinicDeployed(msg.sender, address(newClinic));
        return address(newClinic);
    }

    function addClinicDeployer(address deployer) external onlyOwner {
        require(deployer != address(0), "Invalid address");
        allowedClinicDeployers[deployer] = true;
        emit ClinicDeployerAdded(deployer);
    }

    function removeClinicDeployer(address deployer) external onlyOwner {
        require(allowedClinicDeployers[deployer], "Deployer not found");
        allowedClinicDeployers[deployer] = false;
        emit ClinicDeployerRemoved(deployer);
    }
}
