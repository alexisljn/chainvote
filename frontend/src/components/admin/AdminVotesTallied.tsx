import CardGrid from "../common/CardGrid";
import {useCallback, useContext, useEffect, useState} from "react";
import {CONTRACT_EVENT} from "../../events-manager/VotingEventsManager";
import {getWinningProposal, Proposal, resetVoting} from "../../utils/VotingUtils";
import {ChainVoteContext} from "../../App";
import {fireToast, getErrorMessage} from "../../utils/Utils";

function AdminVotesTallied() {

    const {provider, votingContract, address, modal} = useContext(ChainVoteContext);

    const [winningProposal, setWinningProposal] = useState<Proposal | null>(null);

    const handleLocallyContractEvent = useCallback(async (e: any) => {
        switch (e.detail.type) {
            case 'workflowStatusChange':
                const {workflowStatusChangeCaller} = e.detail.value;
                if (workflowStatusChangeCaller === address) {
                    fireToast('success', 'Voting has been successfully resetting !');

                    modal.hide();
                }
                break;
        }
    }, [votingContract, address, modal]);

    const onResetVotingClick = useCallback(async () => {
        try {
            await resetVoting(provider!, votingContract!);

            modal.show();
        } catch (e: any) {
            console.error(e);

            fireToast('error', getErrorMessage(e));
        }
    }, [provider, votingContract, modal]);

    useEffect(() => {
        window.addEventListener(CONTRACT_EVENT, handleLocallyContractEvent);

        (async () => {
            setWinningProposal(await getWinningProposal(votingContract!))
        })();

        return () => {
            window.removeEventListener(CONTRACT_EVENT, handleLocallyContractEvent);
        }
    }, [votingContract, handleLocallyContractEvent]);


    if (!winningProposal) {
        return (
            <p>Loading...</p>
        )
    }

    return (
        <>
            <h2>Winning proposal</h2>
            <CardGrid proposals={[winningProposal]}></CardGrid>
            <div className="admin-status-steps">
                <div className="admin-status-step">
                    <div className="step-index primary">1</div>
                    <div>
                        <button className="btn primary" onClick={onResetVotingClick}>
                            Reset voting
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default AdminVotesTallied;