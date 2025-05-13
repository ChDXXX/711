// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IHashStorage {
    function storeHash(bytes32 _hash) external;
}

contract SkillWallet is AccessControl, Ownable {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    IHashStorage public hashStorage;

    struct UserInfo {
        uint256 createdAt;
        string customUid;
        string email;
        string name;
        string role;
        string schoolId;
        address walletAddress;
        bytes32 dataHash;
    }
    struct Course {
        string courseId;
        string courseCode;
        string courseTitle;
        uint256 createdAt;
        string schoolId;
    }
    struct Job {
        string jobId;
        string title;
        string description;
        uint256 createdAt;
        string companyId;
    }
    struct Major {
        string majorId;
        string name;
        string schoolId;
    }
    struct School {
        string schoolId;
        string name;
    }
    struct Skill {
        string skillHashKey;
        string courseId;
        string ownerId;
        string description;
        string level;
        uint256 createdAt;
        string reviewedBy;
        uint256 reviewedAt;
        string schoolId;
        string title;
        string status;
    }

    mapping(address => UserInfo) public users;
    mapping(string  => Course)   public courses;
    mapping(string  => Job)      public jobs;
    mapping(string  => Major)    public majors;
    mapping(string  => School)   public schools;
    mapping(string  => Skill)    public skills;

    event UserRegistered(address indexed wallet, bytes32 dataHash);
    event CourseAdded(string indexed courseId);
    event JobAdded(string indexed jobId);
    event MajorAdded(string indexed majorId);
    event SchoolAdded(string indexed schoolId);
    event SkillRecorded(string indexed skillHashKey);

    constructor(address _hashStorageAddress)
        Ownable(msg.sender)
    {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        hashStorage = IHashStorage(_hashStorageAddress);
    }

    function registerUser(
        string calldata customUid,
        string calldata email,
        string calldata name,
        string calldata role,
        string calldata schoolId,
        address walletAddress
    ) external {
        require(users[walletAddress].createdAt == 0, "User exists");
        uint256 ts = block.timestamp;
        bytes32 dh = keccak256(
            abi.encodePacked(ts, customUid, email, name, role, schoolId, walletAddress)
        );
        hashStorage.storeHash(dh);
        users[walletAddress] = UserInfo(
            ts, customUid, email, name, role, schoolId, walletAddress, dh
        );
        emit UserRegistered(walletAddress, dh);
    }

    function addCourse(
        string calldata courseId,
        string calldata courseCode,
        string calldata courseTitle,
        string calldata schoolId
    ) external {
        _checkRole(ADMIN_ROLE);
        require(bytes(courses[courseId].courseId).length == 0, "Course exists");
        courses[courseId] = Course(
            courseId, courseCode, courseTitle, block.timestamp, schoolId
        );
        emit CourseAdded(courseId);
    }

    function addJob(
        string calldata jobId,
        string calldata title,
        string calldata description,
        string calldata companyId
    ) external {
        _checkRole(ADMIN_ROLE);
        require(bytes(jobs[jobId].jobId).length == 0, "Job exists");
        jobs[jobId] = Job(
            jobId, title, description, block.timestamp, companyId
        );
        emit JobAdded(jobId);
    }

    function addMajor(
        string calldata majorId,
        string calldata name,
        string calldata schoolId
    ) external {
        _checkRole(ADMIN_ROLE);
        require(bytes(majors[majorId].majorId).length == 0, "Major exists");
        majors[majorId] = Major(majorId, name, schoolId);
        emit MajorAdded(majorId);
    }

    function addSchool(
        string calldata schoolId,
        string calldata name
    ) external {
        _checkRole(ADMIN_ROLE);
        require(bytes(schools[schoolId].schoolId).length == 0, "School exists");
        schools[schoolId] = School(schoolId, name);
        emit SchoolAdded(schoolId);
    }

    function recordSkill(
        string calldata courseId,
        string calldata ownerId,
        string calldata description,
        string calldata level,
        string calldata schoolId,
        string calldata title,
        string calldata status
    ) external {
        require(bytes(courses[courseId].courseId).length != 0, "Course missing");
        bytes32 hv = keccak256(
            abi.encodePacked(
                block.timestamp,
                courseId,
                ownerId,
                description,
                level,
                schoolId,
                title,
                status
            )
        );
        hashStorage.storeHash(hv);
        string memory key = toString(hv);
        skills[key] = Skill(
            key,
            courseId,
            ownerId,
            description,
            level,
            block.timestamp,
            "",
            0,
            schoolId,
            title,
            status
        );
        emit SkillRecorded(key);
    }

    function toString(bytes32 value) internal pure returns (string memory) {
        bytes memory alphabet = "0123456789abcdef";
        bytes memory str = new bytes(64);
        for (uint256 i = 0; i < 32; i++) {
            str[i*2]     = alphabet[uint8(value[i] >> 4)];
            str[i*2 + 1] = alphabet[uint8(value[i] & 0x0f)];
        }
        return string(str);
    }
}
