import {useContext, useEffect, useState} from "react";
import {ChainVoteContext} from "../../App";
import VotersRegistration from "../admin/VotersRegistration";
import {VotingStatus} from "../../utils/VotingUtils";

function Admin() {

    const {permissions, votingContract} = useContext(ChainVoteContext);

    const [votingStatus, setVotingStatus] = useState<number | null>(null);

    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        if (!votingContract) return;

        (async () => {
           setVotingStatus(await votingContract.getStatus());
        })()
    }, [votingContract])

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
                    <VotersRegistration/>
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