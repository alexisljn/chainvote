import {BigNumber, Contract, ethers, providers} from "ethers";
import VOTING_JSON from "../artifacts/contracts/voting.sol/Voting.json";

export enum VotingStatus {
    RegisteringVoters,
    ProposalsRegistrationStarted,
    ProposalsRegistrationEnded,
    VotingSessionStarted,
    VotingSessionEnded,
    CountingEquality,
    VotesTallied
}

export interface Proposal {
    description: string;
    voteCount: BigNumber
}

export interface ContractPermissions {
    isOwner: boolean,
    canAddProposal: boolean,
    canVote: boolean,
    canRegisterItself: boolean
}

function getVotingContractInstance(provider: providers.Web3Provider): Contract {
    return new ethers.Contract(process.env.REACT_APP_CONTRACT_ADDRESS!, VOTING_JSON.abi, provider);
}

async function getContractPermissions(votingContract: Contract, address: string| null): Promise<ContractPermissions> {
    if (!address) {
        return {isOwner: false, canAddProposal: false, canVote: false, canRegisterItself: false};
    }

    const isUserOwner = await isOwner(votingContract, address);
    const canUserAddProposal = await canAddProposal(votingContract, address);
    const canUserVote = await canVote(votingContract, address);
    const canUserRegisterItself = await canRegisterItself(votingContract, address);

    return {isOwner: isUserOwner, canAddProposal: canUserAddProposal, canVote: canUserVote, canRegisterItself: canUserRegisterItself};
}

async function isOwner(votingContract: Contract, address: string): Promise<boolean> {
    const owner: string = await votingContract.owner();

    return owner === address;
}

async function canVote(votingContract: Contract, address: string): Promise<boolean> {
    return await votingContract.canVote(address);
}

async function canRegisterItself(votingContract: Contract, address: string): Promise<boolean> {
    return await votingContract.canRegisterItself(address);
}

async function canAddProposal(votingContract: Contract, address: string): Promise<boolean> {
    return await votingContract.canAddProposal(address);
}

async function registerVoter(provider: providers.Web3Provider, votingContract: Contract, address: string) {
    const votingContractWithSigner = getVotingContractWithSigner(provider, votingContract);

    await votingContractWithSigner.registerVoter(address);
}

async function startProposalsRegistration(provider: providers.Web3Provider, votingContract: Contract) {
    const votingContractWithSigner = getVotingContractWithSigner(provider, votingContract);

    await votingContractWithSigner.startProposalsRegistration();
}

async function addProposal(provider: providers.Web3Provider, votingContract: Contract, description: string) {
    const votingContractWithSigner = getVotingContractWithSigner(provider, votingContract);

    await votingContractWithSigner.addProposal(description);
}

async function getProposals(votingContract: Contract): Promise<Proposal[]> {
    const proposals = await votingContract.getProposals();

    return generateProposals(proposals);
}

async function endProposalsRegistration(provider: providers.Web3Provider, votingContract: Contract) {
    const votingContractWithSigner = getVotingContractWithSigner(provider, votingContract);

    await votingContractWithSigner.endProposalsRegistration();
}

async function startVotingSession(provider: providers.Web3Provider, votingContract: Contract) {
    const votingContractWithSigner = getVotingContractWithSigner(provider, votingContract);

    await votingContractWithSigner.startVotingSession();
}

async function vote(provider: providers.Web3Provider, votingContract: Contract, id: number) {
    const votingContractWithSigner = getVotingContractWithSigner(provider, votingContract);

    await votingContractWithSigner.vote(id);
}

async function endVotingSession(provider: providers.Web3Provider, votingContract: Contract) {
    const votingContractWithSigner = getVotingContractWithSigner(provider, votingContract);

    await votingContractWithSigner.endVotingSession();
}

function getVotingContractWithSigner(provider: providers.Web3Provider, votingContract: Contract): Contract {
    const signer = provider.getSigner();

    return votingContract.connect(signer);
}

async function getWinningProposal(votingContract: Contract): Promise<Proposal | null> {

    const winningId: number = await votingContract.getWinningProposalId();

    try {
        const winningProposal = await votingContract.proposals(winningId)

        return generateProposals([winningProposal])[0];
    } catch (e) {
        return null;
    }
}

async function resetVoting(provider: providers.Web3Provider, votingContract: Contract) {
    const votingContractWithSigner = getVotingContractWithSigner(provider, votingContract);

    await votingContractWithSigner.resetVoting();
}

async function tallyVotes(provider: providers.Web3Provider, votingContract: Contract) {
    const votingContractWithSigner = getVotingContractWithSigner(provider, votingContract);

    await votingContractWithSigner.pickWinner();
}

async function prepareNewBallot(provider: providers.Web3Provider, votingContract: Contract) {
    const votingContractWithSigner = getVotingContractWithSigner(provider, votingContract);

    await votingContractWithSigner.prepareNewBallot();
}

async function registerItself(provider: providers.Web3Provider, votingContract: Contract) {
    const votingContractWithSigner = getVotingContractWithSigner(provider, votingContract);

    await votingContractWithSigner.enableVoteForNewBallot();
}

async function pickWinnerRandomly(provider: providers.Web3Provider, votingContract: Contract) {
    const votingContractWithSigner = getVotingContractWithSigner(provider, votingContract);

    await votingContractWithSigner.pickWinnerRandomly()
}

async function getWinningProposalsHistory(votingContract: Contract): Promise<Proposal[]> {
    const winningProposalHistory: Proposal[] = [];

    const winningProposalsHistoryCount = await votingContract.getWinningProposalHistoryCount();

    if (winningProposalsHistoryCount.eq(0)) {
        return winningProposalHistory;
    }

    for (let i = 0; i < winningProposalsHistoryCount; i++) {
        winningProposalHistory.push(await votingContract.winningProposalHistory(i))
    }

    return generateProposals(winningProposalHistory);
}

function generateProposals(proposals: any[]): Proposal[] {
    return proposals.map(proposal => ({description: proposal.description, voteCount: proposal.voteCount}));
}

export {
    getVotingContractInstance,
    isOwner,
    canVote,
    canRegisterItself,
    canAddProposal,
    getContractPermissions,
    registerVoter,
    startProposalsRegistration,
    addProposal,
    getProposals,
    endProposalsRegistration,
    startVotingSession,
    vote,
    endVotingSession,
    getWinningProposal,
    resetVoting,
    prepareNewBallot,
    registerItself,
    tallyVotes,
    pickWinnerRandomly,
    getWinningProposalsHistory
}