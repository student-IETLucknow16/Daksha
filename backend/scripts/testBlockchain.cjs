require("dotenv").config();

const {
    issueCertificateOnBlockchain,
    verifyCertificateOnBlockchain
} = require("../src/services/blockchainService");

const testBlockchain = async () => {
    try {
        console.log("Testing blockchain connection...");

        const certificateId = `TEST-${Date.now()}`;

        const result = await issueCertificateOnBlockchain({
            certificateId,
            certificateHash: "test_hash_123456789",
            moduleId: "fire_emergency",
            finalScore: 85
        });

        console.log("\nBlockchain transaction successful!");

        console.log(
            "Transaction ID:",
            result.transactionId
        );

        console.log(
            "Block Number:",
            result.blockNumber
        );

        const verification =
            await verifyCertificateOnBlockchain(certificateId);

        console.log("\nBlockchain verification:");
        console.log(verification);

    } catch (error) {
        console.error("\nBlockchain test failed:");
        console.error(error);
    }
};

testBlockchain();