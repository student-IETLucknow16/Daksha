import { network } from "hardhat";

async function main() {
    console.log("Deploying CertificateRegistry...");

    const { ethers } = await network.connect();

    const CertificateRegistry =
        await ethers.getContractFactory("CertificateRegistry");

    const certificateRegistry =
        await CertificateRegistry.deploy();

    await certificateRegistry.waitForDeployment();

    const contractAddress =
        await certificateRegistry.getAddress();

    console.log(
        "CertificateRegistry deployed to:",
        contractAddress
    );
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});