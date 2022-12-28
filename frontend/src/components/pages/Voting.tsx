import {useContext, useEffect, useState} from "react";
import {ChainVoteContext} from "../../App";
import {VotingStatus} from "../../utils/VotingUtils";
import ProposalRegistration from "../voting/ProposalRegistration";

function Voting() {

    const {votingContract} = useContext(ChainVoteContext);

    const [votingStatus, setVotingStatus] = useState<number | null>(null);

    useEffect(() => {
        if (!votingContract) return

        (async () => {
            setVotingStatus(await votingContract!.getStatus());
        })()

    }, [votingContract])

    if (!votingContract || !votingStatus) {
        return (
            <div>
                <h1 className="top-grid-area-element">Voting</h1>
                <p>Loading...</p>
            </div>
        )
    }

    switch (votingStatus) {
        case VotingStatus.ProposalsRegistrationStarted:
            return (
                <div>
                    <h1 className="top-grid-area-element">Voting</h1>
                    <ProposalRegistration/>
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