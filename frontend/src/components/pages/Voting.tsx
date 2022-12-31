import {useCallback, useContext, useEffect, useState} from "react";
import {ChainVoteContext} from "../../App";
import {VotingStatus} from "../../utils/VotingUtils";
import ProposalRegistration from "../voting/ProposalRegistration";
import {CONTRACT_EVENT} from "../../events-manager/VotingEventsManager";
import PeriodEnded from "../voting/PeriodEnded";
import VotingSession from "../voting/VotingSession";
import Equality from "../voting/Equality";

function Voting() {

    const {votingContract} = useContext(ChainVoteContext);

    const [votingStatus, setVotingStatus] = useState<number | null>(null);

    const handleLocallyContractEvents = useCallback(async (e: any) => {
        switch (e.detail.type) {
            case 'workflowStatusChange':
                setVotingStatus(await votingContract!.getStatus());
                break;
        }
    }, [votingContract]);

    useEffect(() => {
        if (!votingContract) return

        window.addEventListener(CONTRACT_EVENT, handleLocallyContractEvents);

        (async () => {
            setVotingStatus(await votingContract!.getStatus());
        })();

        return () => {
            window.removeEventListener(CONTRACT_EVENT, handleLocallyContractEvents)
        }
    }, [votingContract, handleLocallyContractEvents]);

    if (!votingContract || votingStatus === null) {
        return (
            <div>
                <h1 className="top-grid-area-element">Voting</h1>
                <p>Loading...</p>
            </div>
        )
    }

    switch (votingStatus) {
        case VotingStatus.RegisteringVoters:
            return (
                <div>
                    <h1 className="top-grid-area-element">Voting</h1>
                    <p>Administrator is registering voters</p>
                </div>
            )
        case VotingStatus.ProposalsRegistrationStarted:
            return (
                <div>
                    <h1 className="top-grid-area-element">Voting</h1>
                    <ProposalRegistration/>
                </div>
            )
        case VotingStatus.ProposalsRegistrationEnded:
            return (
                <div>
                    <h1 className="top-grid-area-element">Voting</h1>
                    <PeriodEnded period="proposal"/>
                </div>
            )
        case VotingStatus.VotingSessionStarted:
            return (
                <div>
                    <h1 className="top-grid-area-element">Voting</h1>
                    <VotingSession/>
                </div>
            )
        case VotingStatus.VotingSessionEnded:
            return (
                <div>
                    <h1 className="top-grid-area-element">Voting</h1>
                    <PeriodEnded period="voting"/>
                </div>
            )
        case VotingStatus.CountingEquality:
            return (
                <div>
                    <h1 className="top-grid-area-element">Voting</h1>
                    <Equality/>
                </div>
            )
    }

    return (
        <div>
            Error
        </div>
    )
}

export default Voting;