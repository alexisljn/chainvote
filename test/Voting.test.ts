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
            const {voting, owner} = await loadFixture(deployVotingFixture);

            await expect(voting.startProposalsRegistration())
                .to
                .emit(voting, "WorkflowStatusChange")
                .withArgs(WorkflowStatus.RegisteringVoters, WorkflowStatus.ProposalsRegistrationStarted, owner.address)
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
            const {voting, owner} = await loadFixture(deployVotingFixture);

            await voting.startProposalsRegistration();

            await expect(voting.endProposalsRegistration())
                .to
                .emit(voting, "WorkflowStatusChange")
                .withArgs(WorkflowStatus.ProposalsRegistrationStarted, WorkflowStatus.ProposalsRegistrationEnded, owner.address)
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
            const {voting, owner} = await loadFixture(deployVotingFixture);

            await voting.startProposalsRegistration();

            await voting.endProposalsRegistration();

            await expect(voting.startVotingSession())
                .to
                .emit(voting, "WorkflowStatusChange")
                .withArgs(WorkflowStatus.ProposalsRegistrationEnded, WorkflowStatus.VotingSessionStarted, owner.address)
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
            const {voting, owner} = await loadFixture(deployVotingFixture);

            await voting.startProposalsRegistration();

            await voting.endProposalsRegistration();

            await voting.startVotingSession();

            await expect(voting.endVotingSession())
                .to
                .emit(voting, "WorkflowStatusChange")
                .withArgs(WorkflowStatus.VotingSessionStarted, WorkflowStatus.VotingSessionEnded, owner.address)
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

    describe("Registering Voters", () => {
        it("Should emit event when voter successfully registered", async () => {
            const {voting, owner, otherAccounts} = await loadFixture(deployVotingFixture);

            await expect(voting.registerVoter(otherAccounts[0].address))
                .to
                .emit(voting, "VoterRegistered")
                .withArgs(otherAccounts[0].address, owner.address)
            ;
        });

        it("Should revert when registering a voter when not allowed", async () => {
            const {voting, otherAccounts} = await loadFixture(deployVotingFixture);

            await voting.startProposalsRegistration();

            await expect(voting.registerVoter(otherAccounts[0].address))
                .to
                .be
                .revertedWith("Registering new voters is not allowed for the current voting")
            ;
        });

        it("Should revert when registering the 0 address as voter", async () => {
            const {voting} = await loadFixture(deployVotingFixture);

            await expect(voting.registerVoter(ethers.constants.AddressZero))
                .to
                .be
                .revertedWith("0 address is invalid")
            ;
        });

        it("Should revert when registering already-registered voter", async () => {
            const {voting, otherAccounts} = await loadFixture(deployVotingFixture);

            await voting.registerVoter(otherAccounts[0].address)

            await expect(voting.registerVoter(otherAccounts[0].address))
                .to
                .be
                .revertedWith("Voter is already registered")
            ;
        });
    });

    describe('onlyVoter test', () => {
        it("Should not revert if voter calls onlyOwner function", async () => {
            const {voting, owner} = await loadFixture(deployVotingFixture);

            await voting.registerVoter(owner.address);

            await voting.startProposalsRegistration();

            await expect(voting.addProposal('Fixture')).to.be.not.reverted;
        });

        it("Should revert if not voter calls onlyVoter function", async () => {
            const {voting} = await loadFixture(deployVotingFixture);

            await voting.startProposalsRegistration();

            await expect(voting.addProposal('Fixture'))
                .to
                .be
                .revertedWith("Address is not registered as allowed voter")
            ;
        });
    });

    describe("Registering Proposals", () => {
        it("Should emit event when proposal is successfully registered", async () => {
            const {voting, owner} = await loadFixture(deployVotingFixture);

            await voting.registerVoter(owner.address);

            await voting.startProposalsRegistration();

            await expect(voting.addProposal('Fixture'))
                .to
                .emit(voting, "ProposalRegistered")
                .withArgs(0, owner.address)
            ;
        });

        it("Should revert at proposal's submission when not allowed", async () => {
            const {voting, owner} = await loadFixture(deployVotingFixture);

            await voting.registerVoter(owner.address);

            await expect(voting.addProposal('Fixture'))
                .to
                .be
                .revertedWith("Proposal cannot be submitted for the current voting")
            ;
        });

        it("Should revert when proposal is empty", async () => {
            const {voting, owner} = await loadFixture(deployVotingFixture);

            await voting.registerVoter(owner.address);

            await voting.startProposalsRegistration();

            await expect(voting.addProposal(''))
                .to
                .be
                .revertedWith("Proposal description cannot be empty")
            ;
        });
    });

    describe("Vote", () => {
        async function deployAndVoteFixture() {
            const Voting = await ethers.getContractFactory("Voting");

            const [owner, ...otherAccounts] = await ethers.getSigners();

            const voting: Voting = await Voting.deploy();

            await voting.deployed();

            await voting.registerVoter(owner.address);
            await voting.registerVoter(otherAccounts[0].address);
            await voting.registerVoter(otherAccounts[1].address);
            await voting.registerVoter(otherAccounts[2].address);
            await voting.registerVoter(otherAccounts[3].address);

            await voting.startProposalsRegistration();

            await voting.addProposal('Fixture');

            await voting.addProposal('Fixture 2');

            await voting.addProposal('Fixture 3');

            await voting.endProposalsRegistration();

            return {voting, owner, otherAccounts, proposalIds: [0,1,2]};
        }

        it("Should emit event when vote successfully registered", async () => {
            const {voting, owner, otherAccounts, proposalIds} = await loadFixture(deployAndVoteFixture);

            await voting.startVotingSession();

            await expect(voting.vote(proposalIds[0]))
                .to
                .emit(voting, "Voted")
                .withArgs(owner.address, proposalIds[0])
            ;

            const votingOtherAccount0 = voting.connect(otherAccounts[0]);

            await expect(votingOtherAccount0.vote(proposalIds[1]))
                .to
                .emit(votingOtherAccount0, "Voted")
                .withArgs(otherAccounts[0].address, proposalIds[1])
            ;
        });

        it("Should update proposal vote count after vote", async () => {
            const {voting, proposalIds} = await loadFixture(deployAndVoteFixture);

            await voting.startVotingSession();

            await voting.vote(proposalIds[0]);

            const proposal = await voting.proposals(proposalIds[0]);

            expect(proposal.voteCount).to.equal(1);
        });

        it("Should revert if submitting vote when not allowed", async () => {
            const {voting, proposalIds} = await loadFixture(deployAndVoteFixture);

            await expect(voting.vote(proposalIds[0]))
                .to
                .be
                .revertedWith("Vote cannot be submitted for the current voting")
            ;
        });

        it("Should revert if proposal is not found", async () => {
            const {voting} = await loadFixture(deployAndVoteFixture);

            await voting.startVotingSession();

            await expect(voting.vote(42)).to.be.revertedWith("Proposal not found");
        })

        it("Should revert if voter has already voted", async () => {
            const {voting, proposalIds} = await loadFixture(deployAndVoteFixture);

            await voting.startVotingSession();

            await voting.vote(proposalIds[0]);

            await expect(voting.vote(proposalIds[0]))
                .to
                .be
                .revertedWith("Address is not registered as allowed voter")
            ;
        });
    });
});