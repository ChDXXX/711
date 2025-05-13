// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract HashStorage is AccessControl {
    bytes32 public constant STUDENT_ROLE = keccak256("STUDENT_ROLE");
    bytes32 public constant SCHOOL_ROLE  = keccak256("SCHOOL_ROLE");
    bytes32 public constant COMPANY_ROLE = keccak256("COMPANY_ROLE");

    event HashStored(address indexed user, bytes32 hashValue);

    mapping(address => bytes32[]) private userHashes;

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(STUDENT_ROLE, msg.sender);
        _grantRole(SCHOOL_ROLE, msg.sender);
        _grantRole(COMPANY_ROLE, msg.sender);
    }

    function storeHash(bytes32 hashValue) external {
        userHashes[msg.sender].push(hashValue);
        emit HashStored(msg.sender, hashValue);
    }

    function getHashes(address user)
        external
        view
        returns (bytes32[] memory)
    {
        require(
            msg.sender == user ||
            hasRole(SCHOOL_ROLE, msg.sender) ||
            hasRole(COMPANY_ROLE, msg.sender),
            "access denied"
        );
        return userHashes[user];
    }
}
