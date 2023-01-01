import {ethers} from "hardhat";

async function main() {
    const Voting = await ethers.getContractFactory("Voting");

    const voting = await Voting.deploy();

    await voting.deployed();

    console.log(`voting has been deployed at ${voting.address}`);
}

main().catch(e => {
    console.error(e);
    process.exitCode = 1;
});