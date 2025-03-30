// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./IDIDRegistry.sol";
import "./IClinic.sol";

contract MedicalCard {
    struct MedicalRecord {
        string ipfsHash;
        string addedByDID;
        uint256 timestamp;
    }

    string private ownerDID;
    IDIDRegistry public didRegistry;
    mapping(address => address) private authorizedClinics;
    address[] private clinicList;
    MedicalRecord[] private records;

    modifier onlyOwner() {
        require(
            didRegistry.resolveDID(ownerDID) == msg.sender,
            "Only owner can perform this action"
        );
        _;
    }

    modifier onlyAuthorized() {
        require(
            didRegistry.resolveDID(ownerDID) == msg.sender || isDoctorAuthorized(),
            "Access denied"
        );
        _;
    }

    modifier onlyClinic() {
        require(isDoctorAuthorized(), "Only clinic can perform this action");
        _;
    }

    constructor(address _didRegistry, string memory _ownerDID) {
        require(bytes(_ownerDID).length > 0, "Invalid DID");
        require(_didRegistry != address(0), "Invalid DID registry");

        ownerDID = _ownerDID;
        didRegistry = IDIDRegistry(_didRegistry);
    }

    function grantAccess(address clinic, address clinicContract) external onlyOwner {
        require(clinic != address(0) && clinicContract != address(0), "Invalid address");
        require(authorizedClinics[clinic] == address(0), "Clinic is already authorized");

        authorizedClinics[clinic] = clinicContract;
        clinicList.push(clinic);
    }

    function revokeAccess(address clinic) external onlyOwner {
        require(authorizedClinics[clinic] != address(0), "Clinic is not authorized");
        delete authorizedClinics[clinic];

        for (uint256 i = 0; i < clinicList.length; i++) {
            if (clinicList[i] == clinic) {
                clinicList[i] = clinicList[clinicList.length - 1];
                clinicList.pop();
                break;
            }
        }
    }

    function addMedicalRecord(string memory ipfsHash) external onlyClinic {
        require(bytes(ipfsHash).length > 0, "Invalid IPFS hash");

        string memory did = didRegistry.resolveAddress(msg.sender);
        records.push(MedicalRecord(ipfsHash, did, block.timestamp));
    }

    function getMedicalRecords() external view onlyAuthorized returns (MedicalRecord[] memory) {
        return records;
    }

    function isDoctorAuthorized() internal view returns (bool) {
        for (uint256 i = 0; i < clinicList.length; i++) {
            if (IClinic(authorizedClinics[clinicList[i]]).isDoctorRegistered(msg.sender)) {
                return true;
            }
        }
        return false;
    }
}
