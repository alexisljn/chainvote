import CardGrid from "../common/CardGrid";
import {useCallback, useContext, useEffect, useState} from "react";
import {ChainVoteContext} from "../../App";
import {endVotingSession, getProposals, Proposal} from "../../utils/VotingUtils";
import {CONTRACT_EVENT} from "../../events-manager/VotingEventsManager";
import {fireToast, getErrorMessage} from "../../utils/Utils";

function AdminVotingSession() {

    const {provider, votingContract, modal} = useContext(ChainVoteContext);

    const [proposals, setProposals] = useState<Proposal[]>([]);

    const handleLocallyContractEvents = useCallback(async (e: any) => {
        switch (e.detail.type) {
            case 'voted':
                setProposals(await getProposals(votingContract!));
                break;
        }
    }, [votingContract]);

    const onEndVotingSessionClick =  useCallback(async () => {
        try {
            await endVotingSession(provider!, votingContract!);

            modal.show();
        } catch (e) {
            fireToast('error', getErrorMessage(e));
        }
    }, [provider, votingContract, modal]);

    useEffect(() => {
        window.addEventListener(CONTRACT_EVENT, handleLocallyContractEvents);

        (async () => {
            setProposals(await getProposals(votingContract!));
        })();

        return () => {
            window.removeEventListener(CONTRACT_EVENT, handleLocallyContractEvents);
        }
    }, [votingContract]);

    return (
        <>
            <CardGrid proposals={proposals}/>
            <div className="admin-status-steps">
                <div className="admin-status-step">
                    <div className="step-index primary">1</div>
                    <div>
                        <button className="btn primary" onClick={onEndVotingSessionClick}>
                            End voting session
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default AdminVotingSession;