import {Contract, ethers, providers} from "ethers";
import VOTING_JSON from "../artifacts/contracts/voting.sol/Voting.json";

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

export {getVotingContractInstance, isOwner, canVote, canRegisterItself, generateStatusesList}