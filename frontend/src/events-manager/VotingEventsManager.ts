import {Contract} from "ethers";

const CONTRACT_EVENT = "contractEvent"
function listenContractEvents(votingContract: Contract) {
    votingContract.on('VoterRegistered', voterRegisteredHandler);
}

function cleanContractEvents(votingContract: Contract) {
    votingContract.off('VoterRegistered', voterRegisteredHandler);
}

function voterRegisteredHandler(voterAddress: string, caller: string) {
    const event = new CustomEvent(CONTRACT_EVENT, {detail: {type: 'voterRegistered', value: {voterAddress, caller}}});

    window.dispatchEvent(event);
}

export {listenContractEvents, cleanContractEvents, CONTRACT_EVENT}