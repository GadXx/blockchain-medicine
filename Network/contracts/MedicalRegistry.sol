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
    
    mapping(address => Clinic) public clinics;
    mapping(address => Doctor) public doctors;

    address GA = msg.sender;

    function registerClinic(address clinic) public GA {
        clinics[clinic] = Clinic(clinic, true);
    }

    function registerDoctor(address doctor, address clinic) public onlyClinic {
        require(clinics[clinic].registered, "Clinic not registered");
        doctors[doctor] = Doctor(doctor, clinic);
    }
}
