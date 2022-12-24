import {ethers, providers} from "ethers";
import VOTING_JSON from "../artifacts/contracts/voting.sol/Voting.json";
function getVotingContractInstance(provider: providers.Web3Provider) {
    return new ethers.Contract(process.env.REACT_APP_CONTRACT_ADDRESS!, VOTING_JSON.abi, provider.getSigner());
}

export {getVotingContractInstance}