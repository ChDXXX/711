// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SkillWallet {
    struct Student {
        string customUid;
        string email;
        string name;
        string schoolId;
    }

    mapping(string => bytes32) private studentHashes;
    mapping(address => Student) private students;
    mapping(bytes32 => bytes32) private skillHashes;

    event StudentRegistered(string indexed customUid, bytes32 dataHash, address indexed wallet);
    event SkillRecorded(bytes32 indexed recordKey, bytes32 dataHash);

    bytes32[] public recordKeys;

    function registerStudent(
        string calldata customUid,
        string calldata email,
        string calldata name,
        string calldata schoolId,
        address walletAddress
    ) external {
        bytes32 dataHash = keccak256(
            abi.encodePacked(customUid, email, name, schoolId, walletAddress)
        );
        studentHashes[customUid] = dataHash;
        students[walletAddress] = Student(customUid, email, name, schoolId);
        emit StudentRegistered(customUid, dataHash, walletAddress);
    }

    function recordSkill(
        string calldata customUid,
        string calldata courseCode,
        string calldata courseTitle,
        string[] calldata hardSkillNames,
        uint256[] calldata hardSkillScores,
        string calldata level,
        string calldata ownerId,
        uint256 reviewedAt,
        string calldata reviewedBy,
        string calldata schoolId,
        string calldata cid
    ) external {
        require(hardSkillNames.length == hardSkillScores.length, "Mismatched names and scores");

        bytes32 recordKey = keccak256(
            abi.encodePacked(customUid, courseCode, reviewedAt)
        );
        bytes32 dataHash = keccak256(
            abi.encode(
                customUid,
                courseCode,
                courseTitle,
                hardSkillNames,
                hardSkillScores,
                level,
                ownerId,
                reviewedAt,
                reviewedBy,
                schoolId,
                cid
            )
        );

        skillHashes[recordKey] = dataHash;

        recordKeys.push(recordKey);

        emit SkillRecorded(recordKey, dataHash);
    }

    function getStudentHash(string calldata customUid) external view returns (bytes32) {
        return studentHashes[customUid];
    }

    function getStudentByWallet(address walletAddress)
        external
        view
        returns (string memory, string memory, string memory, string memory)
    {
        Student memory s = students[walletAddress];
        return (s.customUid, s.email, s.name, s.schoolId);
    }

    function getSkillHash(bytes32 recordKey) external view returns (bytes32) {
        return skillHashes[recordKey];
    }

    function getAllSkills()
        external
        view
        returns (bytes32[] memory keys, bytes32[] memory hashes)
    {
        uint len = recordKeys.length;
        keys   = new bytes32[](len);
        hashes = new bytes32[](len);
        for (uint i = 0; i < len; i++) {
            bytes32 key = recordKeys[i];
            keys[i]   = key;
            hashes[i] = skillHashes[key];
        }
    }
}
