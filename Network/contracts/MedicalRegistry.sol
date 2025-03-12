// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract MedicalRegistry {
    struct Clinic {
        bool registered;
    }
    
    struct Doctor {
        address clinicAddress;
    }

    struct MedicalRecord {
        address addedBy;
        string ipfsHash;
        uint256 timestamp;
    }

    address private owner;
    
    mapping(address => Clinic) private clinics;
    address[] private clinicList;

    mapping(address => Doctor) private doctors;
    mapping(address => address[]) private clinicDoctors;

    mapping(address => bool) private patients;
    mapping(address => mapping(address => bool)) private patientAccess;
    mapping(address => MedicalRecord[]) private medicalRecords;

    event ClinicRegistered(address indexed clinic);
    event DoctorRegistered(address indexed doctor, address indexed clinic);
    event PatientRegistered(address indexed patient);
    event AccessGranted(address indexed patient, address indexed clinic);
    event AccessRevoked(address indexed patient, address indexed clinic);

    constructor() { 
        owner = msg.sender;
    }

    function registerClinic(address _clinicAddress) external {
        require(msg.sender == owner, "Only owner can register clinics");
        require(!clinics[_clinicAddress].registered, "Clinic already registered");
        
        clinics[_clinicAddress] = Clinic(true);
        clinicList.push(_clinicAddress); 
        emit ClinicRegistered(_clinicAddress);
    }

    function registerDoctor(address _doctorAddress) external {
        require(clinics[msg.sender].registered, "Clinic not registered");
        require(doctors[_doctorAddress].clinicAddress == address(0), "Doctor already registered");
        
        doctors[_doctorAddress] = Doctor(msg.sender);
        clinicDoctors[msg.sender].push(_doctorAddress);
        emit DoctorRegistered(_doctorAddress, msg.sender);
    }

    function registerPatient() external {
        require(!patients[msg.sender], "Patient already registered");
        
        patients[msg.sender] = true;
        emit PatientRegistered(msg.sender);
    }

    function grantAccessToClinic(address _clinicAddress) external {
        require(clinics[_clinicAddress].registered, "Clinic not registered");
        require(!patientAccess[msg.sender][_clinicAddress], "Access already granted");

        patientAccess[msg.sender][_clinicAddress] = true;
        emit AccessGranted(msg.sender, _clinicAddress);
    }

    function removeAccessToClinic(address _clinicAddress) external {
        require(clinics[_clinicAddress].registered, "Clinic not registered");
        require(patientAccess[msg.sender][_clinicAddress], "Access not found");
        
        delete patientAccess[msg.sender][_clinicAddress];
        emit AccessRevoked(msg.sender, _clinicAddress);
    }

    function addMedicalRecord(address _patient, string memory _ipfsHash) external {
        require(doctors[msg.sender].clinicAddress != address(0), "Only registered doctors");
        require(patientAccess[_patient][doctors[msg.sender].clinicAddress], "No access");

        medicalRecords[_patient].push(MedicalRecord({
            addedBy: msg.sender,
            ipfsHash: _ipfsHash,
            timestamp: block.timestamp
        }));
    }

    function getMedicalRecords(address _patient) external view returns (MedicalRecord[] memory) {
        require(patientAccess[_patient][doctors[msg.sender].clinicAddress], "No access");
        return medicalRecords[_patient];
    }
    
    function getClinics() external view returns (address[] memory) {
        require(msg.sender == owner, "Only owner can view clinics");
        return clinicList;
    }

    function getClinicDoctors(address _clinicAddress) external view returns (address[] memory) {
        require(msg.sender == owner, "Only owner can view doctors");
        return clinicDoctors[_clinicAddress];
    }
    
    function getOwner() external view returns (address) {
        return owner;
    }
}
