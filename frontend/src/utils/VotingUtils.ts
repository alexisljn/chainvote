import {Contract, ethers, providers} from "ethers";
import VOTING_JSON from "../artifacts/contracts/voting.sol/Voting.json";
import votersRegistration from "../components/admin/VotersRegistration";

export enum VotingStatus {
    RegisteringVoters,
    ProposalsRegistrationStarted,
    ProposalsRegistrationEnded,
    VotingSessionStarted,
    VotingSessionEnded,
    CountingEquality,
    VotesTallied
}

function getVotingContractInstance(provider: providers.Web3Provider): Contract {
    return new ethers.Contract(process.env.REACT_APP_CONTRACT_ADDRESS!, VOTING_JSON.abi, provider);
}

async function isOwner(votingContract: Contract, address: string): Promise<boolean> {
    const owner: string = await votingContract.owner();

    return owner === address;
}

async function canVote(votingContract: Contract): Promise<boolean> {
    return await votingContract.canVote();
}

async function canRegisterItself(votingContract: Contract): Promise<boolean> {
    return await votingContract.canRegisterItself();
}

async function registerVoter(provider: providers.Web3Provider, votingContract: Contract, address: string) {
    const votingContractWithSigner = getVotingContractWithSigner(provider, votingContract);

    await votingContractWithSigner.registerVoter(address);
}

async function startProposalsRegistration(provider: providers.Web3Provider, votingContract: Contract) {
    const votingContractWithSigner = getVotingContractWithSigner(provider, votingContract);

    await votingContractWithSigner.startProposalsRegistration();
}

function getVotingContractWithSigner(provider: providers.Web3Provider, votingContract: Contract): Contract {
    const signer = provider.getSigner();

    return votingContract.connect(signer);
}

function generateStatusesList(currentStatus: number): string[] {
    const statusLabels = [
        "Voters registration",
        "Proposals registration",
        "Proposals registration ended",
        "Voting session",
        "Voting session ended",
        "Equality",
        "Votes tallied"
    ];

    if (currentStatus !== 5) {
        statusLabels.splice(5, 1);
    }

    return statusLabels;
}

export {
    getVotingContractInstance,
    isOwner,
    canVote,
    canRegisterItself,
    registerVoter,
    startProposalsRegistration,
    generateStatusesList,
}