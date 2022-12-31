import {useCallback, useContext, useEffect, useState} from "react";
import {ChainVoteContext} from "../../App";
import AdminVotersRegistration from "../admin/AdminVotersRegistration";
import {VotingStatus} from "../../utils/VotingUtils";
import {CONTRACT_EVENT} from "../../events-manager/VotingEventsManager";
import AdminProposalsRegistration from "../admin/AdminProposalsRegistration";
import AdminVotingSession from "../admin/AdminVotingSession";
import AdminVotingSessionEnded from "../admin/AdminVotingSessionEnded";
import AdminEquality from "../admin/AdminEquality";

function Admin() {

    const {permissions, votingContract} = useContext(ChainVoteContext);

    const [votingStatus, setVotingStatus] = useState<number | null>(null);

    const [isLoading, setIsLoading] = useState<boolean>(true);

    const handleLocallyContractEvent = useCallback(async (e: any) => {
        switch (e.detail.type) {
            case 'workflowStatusChange':
                setVotingStatus(await votingContract!.getStatus());
        }
    }, [votingContract]);

    useEffect(() => {
        if (!votingContract) return;

        window.addEventListener(CONTRACT_EVENT, handleLocallyContractEvent);

        (async () => {
           setVotingStatus(await votingContract.getStatus());
        })();

        return () => {
            window.removeEventListener(CONTRACT_EVENT, handleLocallyContractEvent);
        }
    }, [votingContract, handleLocallyContractEvent]);

    useEffect(() => {
        const {isOwner} = permissions;

        if (!isOwner) {
            window.location.replace('/unauthorized');
            return;
        }

        setIsLoading(false);
    }, [permissions]);

    if (isLoading || votingStatus === null) {
        return (
            <p>Loading...</p>
        )
    }

    switch (votingStatus) {
        case VotingStatus.RegisteringVoters:
            return (
                <div>
                    <h1 className="top-grid-area-element">Voting administration</h1>
                    <AdminVotersRegistration/>
                </div>
            )
        case VotingStatus.ProposalsRegistrationStarted:
            return (
                <div>
                    <h1 className="top-grid-area-element">Voting administration</h1>
                    <AdminProposalsRegistration type="start"/>
                </div>
            )
        case VotingStatus.ProposalsRegistrationEnded:
            return (
                <div>
                    <h1 className="top-grid-area-element">Voting administration</h1>
                    <AdminProposalsRegistration type="end"/>
                </div>
            )
        case VotingStatus.VotingSessionStarted:
            return (
                <div>
                    <h1 className="top-grid-area-element">Voting administration</h1>
                    <AdminVotingSession/>
                </div>
            )
        case VotingStatus.VotingSessionEnded:
            return (
                <div>
                    <h1 className="top-grid-area-element">Voting administration</h1>
                    <AdminVotingSessionEnded/>
                </div>
            )
        case VotingStatus.CountingEquality:
            return (
                <div>
                    <h1 className="top-grid-area-element">Voting administration</h1>
                    <AdminEquality/>
                </div>
            )
    }

    return (
        <div>
            Error
        </div>
    )
}

export default Admin;