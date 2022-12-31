import {useCallback, useContext, useEffect, useState} from "react";
import {getProposals, prepareNewBallot, Proposal} from "../../utils/VotingUtils";
import CardGrid from "../common/CardGrid";
import {ChainVoteContext} from "../../App";
import {fireToast, getErrorMessage} from "../../utils/Utils";
import {CONTRACT_EVENT} from "../../events-manager/VotingEventsManager";

function AdminEquality() {

    const {provider, votingContract, address, modal} = useContext(ChainVoteContext);

    const [proposals, setProposals] = useState<Proposal[]>([]);

    const handleLocallyContractEvents = useCallback((e: any) => {
        switch (e.detail.type) {
            case "workflowStatusChange":
                const {workflowStatusChangeCaller} = e.detail.value;

                if (address === workflowStatusChangeCaller) {
                    modal.hide();

                    fireToast('success', 'Voting status has been updated !');
                }

                break;
        }
    }, [address]);

    useEffect(() => {
        window.addEventListener(CONTRACT_EVENT, handleLocallyContractEvents);

        (async () => {
            setProposals(await getProposals(votingContract!));
        })();

        return () => {
            window.removeEventListener(CONTRACT_EVENT, handleLocallyContractEvents)
        }
    }, [votingContract, handleLocallyContractEvents])

    const onNewBallotClick = useCallback(async () => {
        try {
            await prepareNewBallot(provider!, votingContract!);

            modal.show();
        } catch (e) {
            fireToast('error', getErrorMessage(e));
        }
    }, [provider, votingContract, modal]);

    return (
        <>
            <CardGrid proposals={proposals}/>
            <div className="admin-status-steps">
                <div className="admin-status-step">
                    <div className="step-index primary">1<span>a</span></div>
                    <div>
                        <button className="btn primary" onClick={onNewBallotClick}>
                            New ballot
                        </button>
                    </div>
                </div>
                <div className="admin-status-step">
                    <div className="step-index primary">1<span>b</span></div>
                    <div>
                        <button className="btn primary">
                            Random winner
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default AdminEquality;