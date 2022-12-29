import CardGrid from "../common/CardGrid";
import {useCallback, useContext, useEffect, useState} from "react";
import {ChainVoteContext} from "../../App";
import {endProposalsRegistration, getProposals, Proposal} from "../../utils/VotingUtils";
import {CONTRACT_EVENT} from "../../events-manager/VotingEventsManager";
import {fireToast, getErrorMessage} from "../../utils/Utils";

function AdminProposalsRegistration() {

    const {provider, votingContract, address, modal} = useContext(ChainVoteContext);

    const [proposals, setProposals] = useState<Proposal[]>([]);

    const handleLocallyContractEvent = useCallback(async (e: any) => {
        switch (e.detail.type) {
            case 'proposalRegistered':
                setProposals(await getProposals(votingContract!));
                break;
            case 'workflowStatusChange':
                const {workflowStatusChangeCaller} = e.detail.value;
                if (workflowStatusChangeCaller === address) {
                    fireToast('success', 'Voting status has been updated !');

                    modal.hide();
                }
                break;
        }
    }, [votingContract, address]);

    const onEndProposalsRegistration = useCallback(async () => {
        try {
            await endProposalsRegistration(provider!, votingContract!);

            modal.show();
        } catch (e) {
            fireToast('error', getErrorMessage(e));
        }
    }, [provider, votingContract]);

    useEffect(() => {
        window.addEventListener(CONTRACT_EVENT, handleLocallyContractEvent);

        (async () => {
            setProposals(await getProposals(votingContract!));
        })();

        return () => {
            window.removeEventListener(CONTRACT_EVENT, handleLocallyContractEvent);
        }
    }, [votingContract, handleLocallyContractEvent]);

    return (
        <>
            <h2>Proposals registration</h2>
            <CardGrid proposals={proposals}/>
            <div className="admin-status-steps">
                <div className="admin-status-step">
                    <div className="step-index primary">1</div>
                    <div>
                        <button className="btn primary" onClick={onEndProposalsRegistration}>
                            End proposal registration
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default AdminProposalsRegistration;