import {ethers, providers} from "ethers";
import VOTING_JSON from "../artifacts/contracts/voting.sol/Voting.json";

function getVotingContractInstance(provider: providers.Web3Provider) {
    return new ethers.Contract(process.env.REACT_APP_CONTRACT_ADDRESS!, VOTING_JSON.abi, provider);
}

function generateStatusesList(currentStatus: number) {
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

export {getVotingContractInstance, generateStatusesList}