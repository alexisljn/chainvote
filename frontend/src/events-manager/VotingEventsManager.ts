import {Contract} from "ethers";

const CONTRACT_EVENT = "contractEvent"
function listenContractEvents(votingContract: Contract) {
    votingContract.on('VoterRegistered', voterRegisteredHandler);

    votingContract.on('WorkflowStatusChange', workflowStatusChangeHandler);

    votingContract.on('ProposalRegistered', proposalRegisteredHandler);
}

function cleanContractEvents(votingContract: Contract) {
    votingContract.off('VoterRegistered', voterRegisteredHandler);

    votingContract.off('WorkflowStatusChange', workflowStatusChangeHandler);

    votingContract.off('ProposalRegistered', proposalRegisteredHandler);
}

function voterRegisteredHandler(voterAddress: string, caller: string) {
    const event = new CustomEvent(CONTRACT_EVENT, {
        detail: {
            type: 'voterRegistered',
            value: {voterAddress, voterRegisteredCaller: caller}
        }
    });

    window.dispatchEvent(event);
}

function workflowStatusChangeHandler(previousStatus: number, newStatus: number, caller: string) {
    const event = new CustomEvent(CONTRACT_EVENT, {
        detail: {
            type: 'workflowStatusChange',
            value: {previousStatus, newStatus, workflowStatusChangeCaller: caller}
        }
    });

    window.dispatchEvent(event);
}

function proposalRegisteredHandler(id: number, caller: string) {
    const event = new CustomEvent(CONTRACT_EVENT, {
        detail: {
            type: 'proposalRegistered',
            value: {proposalRegisteredCaller: caller}
        }
    });

    window.dispatchEvent(event);
}

export {listenContractEvents, cleanContractEvents, CONTRACT_EVENT}