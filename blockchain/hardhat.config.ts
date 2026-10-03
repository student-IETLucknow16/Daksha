import "dotenv/config";
import { defineConfig } from "hardhat/config";
import hardhatEthers from "@nomicfoundation/hardhat-ethers";

export default defineConfig({
    plugins: [hardhatEthers],

    solidity: {
        version: "0.8.34"
    },

    networks: {
        localhost: {
            type: "http",
            url: "http://127.0.0.1:8545"
        },

        sepolia: {
            type: "http",
            url: process.env.SEPOLIA_RPC_URL!,
            chainId: 11155111,
            accounts: [process.env.DEPLOYER_PRIVATE_KEY!]
        }
    }
});