import {ethers} from "hardhat";
import {Voting} from "../typechain-types";
import {loadFixture, mine} from "@nomicfoundation/hardhat-network-helpers";
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

    async function deployAndAddProposalsFixture() {
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

        return {voting, owner, otherAccounts, proposalIds: [0, 1, 2]};
    }

    async function deployAndVoteToEqualityFixture() {
        const Voting = await ethers.getContractFactory("Voting");

        const [owner, ...otherAccounts] = await ethers.getSigners();

        const voting: Voting = await Voting.deploy();

        await voting.deployed();

        await voting.registerVoter(owner.address);
        await voting.registerVoter(otherAccounts[0].address);
        await voting.registerVoter(otherAccounts[1].address);
        await voting.registerVoter(otherAccounts[2].address);
        await voting.registerVoter(otherAccounts[3].address);
        await voting.registerVoter(otherAccounts[4].address);

        await voting.startProposalsRegistration();

        await voting.addProposal('Fixture');

        await voting.addProposal('Fixture 2');

        await voting.addProposal('Fixture 3');

        await voting.endProposalsRegistration();

        await voting.startVotingSession();

        await voting.vote(0);

        const votingOtherAccount0 = voting.connect(otherAccounts[0]);

        await votingOtherAccount0.vote(0);

        const votingOtherAccount1 = voting.connect(otherAccounts[1]);

        await votingOtherAccount1.vote(1);

        const votingOtherAccount2 = voting.connect(otherAccounts[2]);

        await votingOtherAccount2.vote(1);

        const votingOtherAccount3 = voting.connect(otherAccounts[3]);

        await votingOtherAccount3.vote(2);

        const votingOtherAccount4 = voting.connect(otherAccounts[4]);

        await votingOtherAccount4.vote(2);

        await voting.endVotingSession();

        await voting.pickWinner();

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

        it("Should revert when too much proposals are submitted", async () => {
            const {voting, owner} = await loadFixture(deployVotingFixture);

            await voting.registerVoter(owner.address);

            await voting.startProposalsRegistration();

            for (let i = 0; i <= 19; i++) {
                await voting.addProposal(`Fixture ${i + 1}`);
            }

            await expect(voting.addProposal('Fixture 21'))
                .to
                .be
                .revertedWith("Too much proposals for current voting")
            ;
        });
    });

    describe("Vote", () => {
        it("Should emit event when vote successfully registered", async () => {
            const {voting, owner, otherAccounts, proposalIds} = await loadFixture(deployAndAddProposalsFixture);

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
            const {voting, proposalIds} = await loadFixture(deployAndAddProposalsFixture);

            await voting.startVotingSession();

            await voting.vote(proposalIds[0]);

            const proposal = await voting.proposals(proposalIds[0]);

            expect(proposal.voteCount).to.equal(1);
        });

        it("Should revert if submitting vote when not allowed", async () => {
            const {voting, proposalIds} = await loadFixture(deployAndAddProposalsFixture);

            await expect(voting.vote(proposalIds[0]))
                .to
                .be
                .revertedWith("Vote cannot be submitted for the current voting")
            ;
        });

        it("Should revert if proposal is not found", async () => {
            const {voting} = await loadFixture(deployAndAddProposalsFixture);

            await voting.startVotingSession();

            await expect(voting.vote(42)).to.be.revertedWith("Proposal not found");
        })

        it("Should revert if voter has already voted", async () => {
            const {voting, proposalIds} = await loadFixture(deployAndAddProposalsFixture);

            await voting.startVotingSession();

            await voting.vote(proposalIds[0]);

            await expect(voting.vote(proposalIds[0]))
                .to
                .be
                .revertedWith("Address is not registered as allowed voter")
            ;
        });

        describe("Counting votes", () => {
            it("Should emit event in standard scenario for votes counting", async () => {
                const {voting, owner, proposalIds} = await loadFixture(deployAndAddProposalsFixture);

                await voting.startVotingSession();

                await voting.vote(proposalIds[1]);

                await voting.endVotingSession();

                await expect(voting.pickWinner())
                    .to
                    .emit(voting, "WorkflowStatusChange")
                    .withArgs(4, 6, owner.address)
                ;
            });

            it("Should emit event when votes are counted and proposal win after previous equality", async () => {
                const {voting, owner, otherAccounts, proposalIds} = await loadFixture(deployAndAddProposalsFixture);

                await voting.startVotingSession();

                await voting.vote(proposalIds[0]);

                const votingOtherAccount0 = voting.connect(otherAccounts[0]);

                await votingOtherAccount0.vote(proposalIds[1]);

                const votingOtherAccount1 = voting.connect(otherAccounts[1]);

                await votingOtherAccount1.vote(proposalIds[1]);

                await voting.endVotingSession();

                await expect(voting.pickWinner())
                    .to
                    .emit(voting, "WorkflowStatusChange")
                    .withArgs(4, 6, owner.address)
                ;
            });

            it("Should update correctly winning proposal history after counting", async () => {
                const {voting, owner, proposalIds} = await loadFixture(deployAndAddProposalsFixture);

                await voting.startVotingSession();

                await voting.vote(proposalIds[1]);

                await voting.endVotingSession();

                await voting.pickWinner();

                const winningProposalLength = await voting.getWinningProposalHistoryCount();

                expect(winningProposalLength).to.equal(1);
            });

            it("Should emit event when equality at votes counting", async () => {
                const {voting, owner, otherAccounts, proposalIds} = await loadFixture(deployAndAddProposalsFixture);

                await voting.startVotingSession();

                await voting.vote(proposalIds[0]);

                const votingOtherAccount0 = voting.connect(otherAccounts[0]);

                await votingOtherAccount0.vote(proposalIds[1]);

                await voting.endVotingSession();

                await expect(voting.pickWinner())
                    .to
                    .emit(voting, "WorkflowStatusChange")
                    .withArgs(4, 5, owner.address)
                ;
            });

            it("Should emit equality event even if tie contains more of two proposals", async () => {
                const {voting, owner, otherAccounts, proposalIds} = await loadFixture(deployAndAddProposalsFixture);

                await voting.startVotingSession();

                await voting.vote(proposalIds[0]);

                const votingOtherAccount0 = voting.connect(otherAccounts[0]);

                await votingOtherAccount0.vote(proposalIds[1]);

                const votingOtherAccount1 = voting.connect(otherAccounts[1]);

                await votingOtherAccount1.vote(proposalIds[2]);

                await voting.endVotingSession();

                await expect(voting.pickWinner())
                    .to
                    .emit(voting, "WorkflowStatusChange")
                    .withArgs(4, 5, owner.address)
                ;
            });

            it("Should revert at counting votes when not allowed", async () => {
                const {voting, otherAccounts, proposalIds} = await loadFixture(deployAndAddProposalsFixture);

                await voting.startVotingSession();

                await voting.vote(proposalIds[0]);

                const votingOtherAccount0 = voting.connect(otherAccounts[0]);

                await votingOtherAccount0.vote(proposalIds[1]);

                await expect(voting.pickWinner())
                    .to
                    .be
                    .revertedWith("Voting session is not finished")
                ;
            });

            it("Should revert at counting votes when no vote has been submitted", async () => {
                const {voting} = await loadFixture(deployAndAddProposalsFixture);

                await voting.startVotingSession();

                await voting.endVotingSession();

                await expect(voting.pickWinner())
                    .to
                    .be
                    .revertedWith("No proposal has a single vote for the current voting")
                ;
            });

            it("Should revert at counting votes when no proposal has been submitted", async () => {
                const {voting} = await loadFixture(deployVotingFixture);

                await voting.startProposalsRegistration();

                await voting.endProposalsRegistration();

                await voting.startVotingSession();

                await voting.endVotingSession();

                await expect(voting.pickWinner())
                    .to
                    .be
                    .revertedWith("There is no proposal for this voting")
                ;
            });
        });
    });

    describe("Equality use cases", () => {
        describe("Creating new ballot", () => {
            it("Should emit event when additional ballot successfully created", async () => {
                const {voting, owner} = await loadFixture(deployAndVoteToEqualityFixture);

                await expect(voting.prepareNewBallot())
                    .to
                    .emit(voting, "WorkflowStatusChange")
                    .withArgs(5, 3, owner.address)
                ;
            });

            it("Should check that proposals has a length equal to tied proposals count after new ballot preparation", async () => {
                const {voting} = await loadFixture(deployAndVoteToEqualityFixture);

                await voting.prepareNewBallot();

                const proposals = await voting.getProposals();

                expect(proposals.length).to.equal(3);
            });

            it("Should check that new ballot proposals have 0 votes", async () => {
                const {voting} = await loadFixture(deployAndVoteToEqualityFixture);

                await voting.prepareNewBallot();

                const firstProposal = await voting.proposals(0);
                const secondProposal = await voting.proposals(1);
                const thirdProposal = await voting.proposals(2);

                expect(firstProposal.voteCount).to.equal(0);
                expect(secondProposal.voteCount).to.equal(0);
                expect(thirdProposal.voteCount).to.equal(0);
            });

            it("Should revert at new ballot preparation when not allowed", async () => {
                const {voting} = await loadFixture(deployVotingFixture);

                await expect(voting.prepareNewBallot())
                    .to
                    .be
                    .revertedWith("New ballot can only be prepared for an equality")
                ;
            });
        });

        describe("Register as voter for new ballots", () => {

            it("Should emit event after voter register for new ballot", async () => {
                const {voting, owner} = await loadFixture(deployAndVoteToEqualityFixture);

                await expect(voting.enableVoteForNewBallot())
                    .to
                    .emit(voting, "VoterRegistered")
                    .withArgs(owner.address, owner.address)
                ;
            });

            it("Should revert if voter wants to register for new ballot when not allowed", async () => {
                const {voting} = await loadFixture(deployAndVoteToEqualityFixture);

                await voting.prepareNewBallot();

                await expect(voting.enableVoteForNewBallot())
                    .to
                    .be
                    .revertedWith("No need to register again as voter now")
                ;
            });

            it("Should revert if non-registered address tries to register itself for new ballot", async () => {
                const {voting, otherAccounts} = await loadFixture(deployAndVoteToEqualityFixture);

                const votingOtherAccount5 = voting.connect(otherAccounts[5]);

                await expect(votingOtherAccount5.enableVoteForNewBallot())
                    .to
                    .be
                    .revertedWith("You wasn't registered as voter for current voting")
                ;
            });

            it("Should revert is voter is already registered for new ballot", async () => {
                const {voting} = await loadFixture(deployAndVoteToEqualityFixture);

                await voting.enableVoteForNewBallot();

                await expect(voting.enableVoteForNewBallot())
                    .to
                    .be.revertedWith("Already registered")
                ;
            });
        });

        describe("Pick winner randomly", () => {
            it("Should emit event when winning proposal has been picked randomly", async () => {
                const {voting, owner} = await loadFixture(deployAndVoteToEqualityFixture);

                await expect(voting.pickWinnerRandomly())
                    .to
                    .emit(voting, "WorkflowStatusChange")
                    .withArgs(5, 6, owner.address)
                ;
            });

            it("Should check that winning proposal id picked randomly is correct", async () => {
                const {voting} = await loadFixture(deployAndVoteToEqualityFixture);

                await mine(25);

                await voting.pickWinnerRandomly();

                const winningProposalId = await voting.getWinningProposalId();

                expect([0,1,2]).to.include(winningProposalId);
            });

            it("Should revert at picking randomly a winner when not allowed", async () => {
                const {voting} = await loadFixture(deployVotingFixture);

                await expect(voting.pickWinnerRandomly())
                    .to
                    .be
                    .revertedWith("Winning proposal can only be randomly picked if there is an equality")
                ;
            });
        });
    });

    describe('Reset Voting', () => {
        it("Should emit event when reset voting successfully processed", async () => {
            const {voting, owner} = await loadFixture(deployAndVoteToEqualityFixture);

            await voting.pickWinnerRandomly();

            await expect(voting.resetVoting())
                .to
                .emit(voting, "WorkflowStatusChange")
                .withArgs(6, 0, owner.address)
            ;
        });

        it("Should emit event when reset voting successfully processed with no votes for no proposal", async () => {
            const {voting, owner} = await loadFixture(deployAndAddProposalsFixture);

            await voting.startVotingSession();

            await voting.endVotingSession();

            await expect(voting.resetVoting())
                .to
                .emit(voting, "WorkflowStatusChange")
                .withArgs(4, 0, owner.address)
            ;
        });

        it("Should emit event when reset voting successfully processed with no proposal submitted for voting", async () => {
            const {voting, owner} = await loadFixture(deployVotingFixture);

            await voting.startProposalsRegistration();

            await voting.endProposalsRegistration();

            await voting.startVotingSession();

            await voting.endVotingSession();

            await expect(voting.resetVoting())
                .to
                .emit(voting, "WorkflowStatusChange")
                .withArgs(4, 0, owner.address)
            ;
        });

        it("Should revert when consulting first proposal after reset", async () => {
            const {voting} = await loadFixture(deployAndVoteToEqualityFixture);

            await voting.pickWinnerRandomly();

            await voting.resetVoting();

            await expect(voting.proposals(0)).to.be.reverted;
        });

        it("Should revert at reset voting when not allowed", async () => {
            const {voting} = await loadFixture(deployAndVoteToEqualityFixture);

            await expect(voting.resetVoting())
                .to
                .be
                .revertedWith("Resetting voting is not allowed")
            ;
        });

        it("Should emit event when registered voter for previous voting, is registered again", async () => {
            const {voting, owner} = await loadFixture(deployAndVoteToEqualityFixture);

            await voting.pickWinnerRandomly();

            await voting.resetVoting();

            await expect(voting.registerVoter(owner.address))
                .to
                .emit(voting, "VoterRegistered")
                .withArgs(owner.address, owner.address)
            ;
        });
    });

    describe("Helper functions", () => {
        describe("canAddProposal", () => {
            it("Should return true when registered address calls function", async () => {
                const {voting, owner} = await loadFixture(deployVotingFixture);

                await voting.registerVoter(owner.address);

                await voting.startProposalsRegistration();

                const canAddProposal = await voting.canAddProposal(owner.address);

                expect(canAddProposal).true;
            })

            it("Should return false when non registered address calls function", async () => {
                const {voting, owner} = await loadFixture(deployVotingFixture);

                await voting.startProposalsRegistration();

                const canAddProposal = await voting.canAddProposal(owner.address);

                expect(canAddProposal).false;
            })

            it("Should return false when address calls function when not allowed", async () => {
                const {voting, owner} = await loadFixture(deployVotingFixture);

                const canAddProposal = await voting.canAddProposal(owner.address);

                expect(canAddProposal).false;
            })
        })

        describe("canVote", () => {
            it("Should return true when registered address is allowed to vote", async () => {
                const {voting, owner} = await loadFixture(deployAndAddProposalsFixture);

                await voting.startVotingSession();

                const canVote = await voting.canVote(owner.address);

                expect(canVote).true;
            });

            it("Should return false when non-registered address call function", async () => {
                const {voting, otherAccounts} = await loadFixture(deployAndAddProposalsFixture);

                const votingOtherAccounts4 = voting.connect(otherAccounts[4]);

                const canVote = await votingOtherAccounts4.canVote(otherAccounts[4].address);

                expect(canVote).false;
            });

            it("Should return false when function called outside of voting session", async () => {
                const {voting, owner} = await loadFixture(deployAndVoteToEqualityFixture);

                const canVote = await voting.canVote(owner.address);

                expect(canVote).false;
            })
        });

        describe("canRegisterItself", () => {
            it("Should return true when registered address is allowed to register for new ballot", async () => {
                const {voting, owner} = await loadFixture(deployAndVoteToEqualityFixture);

                const canRegister = await voting.canRegisterItself(owner.address);

                expect(canRegister).true;
            });

            it("Should return false when non registered address is allowed to register for new ballot", async () => {
                const {voting,otherAccounts} = await loadFixture(deployAndVoteToEqualityFixture);

                const votingOtherAccounts5 = voting.connect(otherAccounts[5]);

                const canRegister = await votingOtherAccounts5.canRegisterItself(otherAccounts[5].address);

                expect(canRegister).false;
            });

            it("Should return false when registering itself is not allowed", async () => {
                const {voting, owner} = await loadFixture(deployVotingFixture);

                const canRegister = await voting.canRegisterItself(owner.address);

                expect(canRegister).false;
            });
        });
    });
});