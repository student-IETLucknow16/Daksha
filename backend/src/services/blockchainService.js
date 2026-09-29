const { ethers } = require("ethers");

const getBlockchainProvider = () => {
    const rpcUrl = process.env.BLOCKCHAIN_RPC_URL;

    if (!rpcUrl) {
        throw new Error("BLOCKCHAIN_RPC_URL is not configured");
    }

    return new ethers.JsonRpcProvider(rpcUrl);
};

const getBlockchainWallet = () => {
    const privateKey = process.env.BLOCKCHAIN_PRIVATE_KEY;

    if (!privateKey) {
        throw new Error("BLOCKCHAIN_PRIVATE_KEY is not configured");
    }

    const provider = getBlockchainProvider();

    return new ethers.Wallet(
        privateKey,
        provider
    );
};

const getCertificateContract = () => {
    const contractAddress =
        process.env.CERTIFICATE_CONTRACT_ADDRESS;

    if (!contractAddress) {
        throw new Error(
            "CERTIFICATE_CONTRACT_ADDRESS is not configured"
        );
    }

    const wallet = getBlockchainWallet();

    const abi = [
        "function issueCertificate(string certificateId, string certificateHash, string moduleId, uint256 finalScore) external",

        "function verifyCertificate(string certificateId) external view returns (string certificateHash, string moduleId, uint256 finalScore, uint256 timestamp, bool exists)"
    ];

    return new ethers.Contract(
        contractAddress,
        abi,
        wallet
    );
};

const issueCertificateOnBlockchain = async ({
    certificateId,
    certificateHash,
    moduleId,
    finalScore
}) => {
    const contract = getCertificateContract();

    console.log(
        "[Blockchain] Issuing certificate:",
        certificateId
    );

    const transaction =
        await contract.issueCertificate(
            certificateId,
            certificateHash,
            moduleId,
            finalScore
        );

    console.log(
        "[Blockchain] Transaction submitted:",
        transaction.hash
    );

    const receipt = await transaction.wait();

    console.log(
        "[Blockchain] Transaction confirmed:",
        receipt.hash
    );

    return {
        transactionId: receipt.hash,
        blockNumber: receipt.blockNumber
    };
};

const verifyCertificateOnBlockchain = async (
    certificateId
) => {
    const contract = getCertificateContract();

    const result =
        await contract.verifyCertificate(
            certificateId
        );

    return {
        certificateHash: result[0],
        moduleId: result[1],
        finalScore: Number(result[2]),
        timestamp: Number(result[3]),
        exists: result[4]
    };
};

module.exports = {
    issueCertificateOnBlockchain,
    verifyCertificateOnBlockchain
};