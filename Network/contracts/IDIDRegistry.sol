// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

interface IDIDRegistry {
    function resolveDID(string memory _did) external view returns (address);
    function resolveAddress(address _address) external view returns (string memory);
}
