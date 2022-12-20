import {ethers} from "hardhat";
import {Voting} from "../typechain-types";

describe("Subscription smart contract test", () => {
    async function deployVotingFixture() {
        const Voting = await ethers.getContractFactory("Voting");

        const [owner, ...otherAccounts] = await ethers.getSigners();

        const voting = await Voting.deploy() as Voting;

        await voting.deployed();

        return {voting, owner, otherAccounts};
    }
})