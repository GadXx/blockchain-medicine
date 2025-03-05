// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract Registry {
    struct Clinic {
        address clinicAddress;
        bool registered;
    }
    
    struct Doctor {
        address doctorAddress;
        address clinicAddress;
    }

    struct Patient {
        address patientAddress;
        string[] medicalRecords; 
    }
    
    address private owner;
    
    mapping(address => Clinic) private clinics;
    address[] private clinicList; 

    mapping(address => Doctor) private doctors;
    mapping(address => address[]) private clinicDoctors; 

    mapping(address => Patient) private patients;

    mapping(address => address[]) private patientAccess;

    constructor() { 
        owner = msg.sender;
    }

    function registerClinic(address _clinicAddress) external {
        require(msg.sender == owner, "You are not the owner");
        if (clinics[_clinicAddress].registered) {
            revert("This clinic is already registered");
        }
        clinics[_clinicAddress] = Clinic(_clinicAddress, true);
        clinicList.push(_clinicAddress); 
    }

    function registerDoctor(address _doctorAddress) external {
        address _clinicAddress = msg.sender;
        if (!clinics[_clinicAddress].registered) {
            revert("Clinic is not registered");
        }
        if (_clinicAddress != msg.sender) {
            revert("You are not the owner of this clinic");
        }
        doctors[_doctorAddress] = Doctor(_doctorAddress, _clinicAddress);
        clinicDoctors[_clinicAddress].push(_doctorAddress); 
    }

    function registerPatient() external {
        address _patientAddress = msg.sender;
        require(patients[_patientAddress].patientAddress == address(0), "Patient is already registered");
        patients[_patientAddress] = Patient(_patientAddress, new string[](0));
    }


    function grantAccessToClinic(address _clinicAddress) external {
        require(clinics[_clinicAddress].registered, "Clinic is not registered");

        address _patientAddress = msg.sender;
        for (uint i = 0; i < patientAccess[_patientAddress].length; i++) {
            require(patientAccess[_patientAddress][i] != _clinicAddress, "Access already granted");
        }

        patientAccess[_patientAddress].push(_clinicAddress);
    }

    function removeAccessToClinic(address _clinicAddress) external {
        require(clinics[_clinicAddress].registered, "Clinic is not registered");

        address _patientAddress = msg.sender;

        uint index = type(uint).max;
        for (uint i = 0; i < patientAccess[_patientAddress].length; i++) {
            if (patientAccess[_patientAddress][i] == _clinicAddress) {
                index = i;
                break;
            }
        }
        require(index != type(uint).max, "Clinic access not found");

        for (uint i = index; i < patientAccess[_patientAddress].length - 1; i++) {
            patientAccess[_patientAddress][i] = patientAccess[_patientAddress][i + 1];
        }

        patientAccess[_patientAddress].pop();
    }

    function getMedicalRecords(address _patientAddress) external view returns (string[] memory) {
        address clinic = address(0); 

        for (uint i = 0; i < patientAccess[_patientAddress].length; i++) {
            if (patientAccess[_patientAddress][i] == doctors[msg.sender].clinicAddress) {
                clinic = patientAccess[_patientAddress][i];
                break;
            }
        }

        require(clinic != address(0), "No access granted"); 
        require(doctors[msg.sender].clinicAddress == clinic, "You are not a doctor of this clinic");

        return patients[_patientAddress].medicalRecords;
    }

    function getClinics() external view returns (address[] memory) {
        require(msg.sender == owner, "You are not the owner");
        return clinicList;
    }

    function getClinicDoctors(address _clinicAddress) external view returns (address[] memory) {
        require(msg.sender == owner, "You are not the owner");
        return clinicDoctors[_clinicAddress];
    }

    function getOwner() external view returns (address) {
        return owner;
    }

}
