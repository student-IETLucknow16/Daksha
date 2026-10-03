//SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract CertificateRegistry {

    struct Certificate {
        string certificateHash;
        string moduleId;
        uint256 finalScore;
        uint256 timestamp;
        bool exists;
    }

    mapping(string => Certificate) private certificates;

    event CertificateIssued(
        string certificateId,
        string certificateHash,
        string moduleId,
        uint256 finalScore,
        uint256 timestamp
    );

    function issueCertificate(
        string memory certificateId,
        string memory certificateHash,
        string memory moduleId,
        uint256 finalScore
    ) external {

        require(
            !certificates[certificateId].exists,
            "Certificate already exists"
        );

        certificates[certificateId] = Certificate({
            certificateHash: certificateHash,
            moduleId: moduleId,
            finalScore: finalScore,
            timestamp: block.timestamp,
            exists: true
        });

        emit CertificateIssued(
            certificateId,
            certificateHash,
            moduleId,
            finalScore,
            block.timestamp
        );
    }

    function verifyCertificate(
        string memory certificateId
    )
        external
        view
        returns (
            string memory certificateHash,
            string memory moduleId,
            uint256 finalScore,
            uint256 timestamp,
            bool exists
        )
    {
        Certificate memory certificate =
            certificates[certificateId];

        return (
            certificate.certificateHash,
            certificate.moduleId,
            certificate.finalScore,
            certificate.timestamp,
            certificate.exists
        );
    }
}