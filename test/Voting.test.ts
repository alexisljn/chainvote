import {ethers} from "hardhat";
import {Voting} from "../typechain-types";
import {loadFixture} from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";


describe("Voting smart contract test", () => {
    async function deployVotingFixture() {
        const Voting = await ethers.getContractFactory("Voting");

        const [owner, ...otherAccounts] = await ethers.getSigners();

        const voting: Voting = await Voting.deploy();

        await voting.deployed();

        return {voting, owner, otherAccounts};
    }

    describe("OnlyOwner test", () => {
        it("Should not revert if owner calls onlyOwner function", async () => {
            const {voting} = await loadFixture(deployVotingFixture);

            await expect(voting.startProposalsRegistration()).to.be.not.reverted;
        });

        it("Should revert if not owner calls onlyOwner function", async () => {
            const {voting, otherAccounts} = await loadFixture(deployVotingFixture);

            const notOwnerVotingContract = voting.connect(otherAccounts[0]);

            await expect(notOwnerVotingContract.startProposalsRegistration())
                .to
                .be
                .revertedWith("Ownable: caller is not the owner")
            ;
        });
    });

        });
    });

});