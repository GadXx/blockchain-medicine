// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./IDIDRegistry.sol";

contract DIDRegistry is IDIDRegistry {
    mapping(string => address) private didToAddress;
    mapping(address => string) private addressToDid;

    function registerDID(string memory did) external {
        require(didToAddress[did] == address(0), "DID already registered");
        require(bytes(did).length > 0, "Invalid DID");

        didToAddress[did] = msg.sender;
        addressToDid[msg.sender] = did;
    }

    function updateDID(string memory did, address newOwner) external {
        require(didToAddress[did] == msg.sender, "Only owner can update DID");
        require(newOwner != address(0), "Invalid new owner");

        didToAddress[did] = newOwner;
        addressToDid[newOwner] = did;
    }

    function resolveDID(string memory _did) external view returns (address) {
        return didToAddress[_did];
    }

    function resolveAddress(address _address) external view returns (string memory) {
        return addressToDid[_address];
    }
}
