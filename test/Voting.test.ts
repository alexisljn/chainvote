import {ethers} from "hardhat";
import {Voting} from "../typechain-types";
import {loadFixture} from "@nomicfoundation/hardhat-network-helpers";
import {expect} from "chai";

enum WorkflowStatus {
    RegisteringVoters,
    ProposalsRegistrationStarted,
    ProposalsRegistrationEnded,
    VotingSessionStarted,
    VotingSessionEnded,
    CountingEquality,
    VotesTallied
}

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

    describe("Workflow status change (except RegisteringVoters)", () => {
        it("Should emit event when owner start proposals registration", async () => {
            const {voting} = await loadFixture(deployVotingFixture);

            await expect(voting.startProposalsRegistration())
                .to
                .emit(voting, "WorkflowStatusChange")
                .withArgs(WorkflowStatus.RegisteringVoters, WorkflowStatus.ProposalsRegistrationStarted)
            ;
        });

        it("Should revert when owner start proposals registration when not allowed", async () => {
            const {voting} = await loadFixture(deployVotingFixture);

            await voting.startProposalsRegistration();

            await expect(voting.startProposalsRegistration())
                .to
                .be
                .revertedWith('Current voting is not registering voters')
            ;
        });

        it("Should emit event when owner end proposals registration", async () => {
            const {voting} = await loadFixture(deployVotingFixture);

            await voting.startProposalsRegistration();

            await expect(voting.endProposalsRegistration())
                .to
                .emit(voting, "WorkflowStatusChange")
                .withArgs(WorkflowStatus.ProposalsRegistrationStarted, WorkflowStatus.ProposalsRegistrationEnded)
            ;
        });

        it("Should revert when owner end proposals registration when not allowed", async () => {
            const {voting} = await loadFixture(deployVotingFixture);

            await voting.startProposalsRegistration();

            await voting.endProposalsRegistration();

            await expect(voting.endProposalsRegistration())
                .to
                .be
                .revertedWith('Current voting is not registering proposals')
            ;
        });

        it("Should emit event when owner start voting session", async () => {
            const {voting} = await loadFixture(deployVotingFixture);

            await voting.startProposalsRegistration();

            await voting.endProposalsRegistration();

            await expect(voting.startVotingSession())
                .to
                .emit(voting, "WorkflowStatusChange")
                .withArgs(WorkflowStatus.ProposalsRegistrationEnded, WorkflowStatus.VotingSessionStarted)
            ;
        });

        it("Should revert when owner start voting session when not allowed", async () => {
            const {voting} = await loadFixture(deployVotingFixture);

            await voting.startProposalsRegistration();

            await voting.endProposalsRegistration();

            await voting.startVotingSession();

            await expect(voting.startVotingSession())
                .to
                .be
                .revertedWith('Current voting is still registering proposals')
            ;
        });

        it("Should emit event when owner end voting session", async () => {
            const {voting} = await loadFixture(deployVotingFixture);

            await voting.startProposalsRegistration();

            await voting.endProposalsRegistration();

            await voting.startVotingSession();

            await expect(voting.endVotingSession())
                .to
                .emit(voting, "WorkflowStatusChange")
                .withArgs(WorkflowStatus.VotingSessionStarted, WorkflowStatus.VotingSessionEnded)
            ;
        });

        it("Should revert when owner end voting session when not allowed", async () => {
            const {voting} = await loadFixture(deployVotingFixture);

            await voting.startProposalsRegistration();

            await voting.endProposalsRegistration();

            await voting.startVotingSession();

            await voting.endVotingSession();

            await expect(voting.endVotingSession())
                .to
                .be
                .revertedWith('Current voting session hasn\'t started')
            ;
        });
    });

});