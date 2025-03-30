// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

interface IClinic {
    function isDoctorRegistered(address doctor) external view returns (bool);
}