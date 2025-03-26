// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

interface IClinic {
    function isDoctorRegistered(string memory did) external view returns (bool);
}
