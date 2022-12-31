import CardGrid from "../common/CardGrid";
import {useCallback, useContext, useEffect, useState} from "react";
import {ChainVoteContext} from "../../App";
import {getProposals, getWinningProposal, Proposal, resetVoting, tallyVotes} from "../../utils/VotingUtils";
import {fireToast, getErrorMessage} from "../../utils/Utils";
import {CONTRACT_EVENT} from "../../events-manager/VotingEventsManager";

function AdminVotingSessionEnded() {

    const {provider, votingContract, address, modal} = useContext(ChainVoteContext);

    const [proposals, setProposals] = useState<Proposal[]>([]);

    const [winningProposal, setWinningProposal] = useState<Proposal| null | undefined>(undefined);

    const handleLocallyContractEvents = useCallback((e: any) => {
        switch (e.detail.type) {
            case 'workflowStatusChange':
                const {workflowStatusChangeCaller} = e.detail.value;

                if (address === workflowStatusChangeCaller) {
                    modal.hide();

                    fireToast('success', 'Voting status has been updated !');
                }

                break;
        }

    }, [address, modal])

    const onResetVotingClick = useCallback(async () => {
        try {
            await resetVoting(provider!, votingContract!);

            modal.show();
        } catch (e: any) {
            console.error(e);
            fireToast('error', getErrorMessage(e));
        }
    }, [provider, votingContract, modal]);

    const onTallyVotesClick = useCallback(async () => {
        try {
            await tallyVotes(provider!, votingContract!);

            modal.show();
        } catch (e: any) {
            fireToast('error', getErrorMessage(e));
        }
    }, [provider, votingContract, modal]);

    useEffect(() => {

        window.addEventListener(CONTRACT_EVENT, handleLocallyContractEvents);

        (async () => {
            setProposals(await getProposals(votingContract!));

            setWinningProposal(await getWinningProposal(votingContract!));
        })();

        return () => {
            window.removeEventListener(CONTRACT_EVENT, handleLocallyContractEvents);
        }

    }, [votingContract, handleLocallyContractEvents]);

    if (winningProposal === undefined) {
        return (
            <p>Loading...</p>
        )
    }

    // No proposal submitted || No vote, ballot stuck
    if (winningProposal === null || winningProposal.voteCount.eq(0)) {
        return (
            <>
                <CardGrid proposals={proposals}/>
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

    return (
        <>
            <CardGrid proposals={proposals}/>
            <div className="admin-status-steps">
                <div className="admin-status-step">
                    <div className="step-index primary">1</div>
                    <div>
                        <button className="btn primary" onClick={onTallyVotesClick}>
                            Tally votes
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default AdminVotingSessionEnded;