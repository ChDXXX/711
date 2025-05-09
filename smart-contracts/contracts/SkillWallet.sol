// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0; // Solidity 编译版本 version

/// @title SkillWallet - 用户信息存储合约 Smart Contract
/// @notice 注册后自动将用户数据添加到区块链，并仅允许本人读取
contract SkillWallet {
    // 用户信息结构体 UserInfo struct
    struct UserInfo {
        uint256 createdAt;     // 创建时间戳 created timestamp
        string customUid;      // Firebase 自定义 UID custom UID
        string email;          // 用户邮箱 email
        string name;           // 用户名 name
        string role;           // 用户角色 role
        string schoolId;       // 学校 ID school ID
        address walletAddress; // 钱包地址 wallet address
        string ipfsHash;       // 预留 IPFS 哈希字段 IPFS hash
    }

    // 映射 mapping：从 customUid 到 UserInfo
    mapping(string => UserInfo) private users;

    // 事件 event：用户注册后触发
    event UserRegistered(string customUid, address indexed walletAddress);

    /// @notice 注册用户 registerUser，将前端 Firebase 信息写入链上
    /// @param _createdAt Firebase 创建时间戳 created timestamp
    /// @param _customUid Firebase 自定义 UID custom UID
    /// @param _email 用户邮箱 email
    /// @param _name 用户名 name
    /// @param _role 用户角色 role
    /// @param _schoolId 学校 ID school ID
    function registerUser(
        uint256 _createdAt,
        string calldata _customUid,
        string calldata _email,
        string calldata _name,
        string calldata _role,
        string calldata _schoolId
    ) external {
        // 防止重复注册 require
        require(
            bytes(users[_customUid].customUid).length == 0,
            "user already registered"
        );

        // 写入映射 mapping
        users[_customUid] = UserInfo({
            createdAt: _createdAt,
            customUid: _customUid,
            email: _email,
            name: _name,
            role: _role,
            schoolId: _schoolId,
            walletAddress: msg.sender,
            ipfsHash: ""
        });

        // 触发事件 event
        emit UserRegistered(_customUid, msg.sender);
    }

    /// @notice 获取用户信息 getUserInfo，仅限本人调用
    /// @param _customUid Firebase 自定义 UID custom UID
    function getUserInfo(string calldata _customUid)
        external
        view
        returns (
            uint256 createdAt,
            string memory customUid,
            string memory email,
            string memory name,
            string memory role,
            string memory schoolId,
            address walletAddress,
            string memory ipfsHash
        )
    {
        UserInfo storage info = users[_customUid];
        // 仅本人访问 require
        require(
            info.walletAddress == msg.sender,
            "no permission"
        );

        return (
            info.createdAt,
            info.customUid,
            info.email,
            info.name,
            info.role,
            info.schoolId,
            info.walletAddress,
            info.ipfsHash
        );
    }

    /// @notice 更新 IPFS 哈希 setIpfsHash，预留接口
    /// @param _customUid Firebase 自定义 UID custom UID
    /// @param _ipfsHash IPFS 哈希 IPFS hash
    function setIpfsHash(string calldata _customUid, string calldata _ipfsHash) external {
        UserInfo storage info = users[_customUid];
        require(
            info.walletAddress == msg.sender,
            "no permission ifps"
        );
        info.ipfsHash = _ipfsHash;
    }
}
