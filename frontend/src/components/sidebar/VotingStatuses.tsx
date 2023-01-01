import {useCallback, useContext, useEffect, useMemo, useState} from "react";
import {ChainVoteContext} from "../../App";
import {CONTRACT_EVENT} from "../../events-manager/VotingEventsManager";

function VotingStatuses() {

    const {votingContract} = useContext(ChainVoteContext);

    const [currentStatus, setCurrentStatus] = useState<number | null>(null);

    const handleLocallyContractEvent = useCallback(async (e: any) => {
        switch (e.detail.type) {
            case 'workflowStatusChange':
                setCurrentStatus(await votingContract!.getStatus());
        }
    }, [votingContract]);

    const statusLabels = useMemo(() => {
        return [
            "Voters registration",
            "Proposals registration",
            "Proposals registration ended",
            "Voting session",
            "Voting session ended",
            "Equality",
            "Votes tallied"
        ];
    }, []);

    useEffect(() => {
        if (!votingContract) return;

        window.addEventListener(CONTRACT_EVENT, handleLocallyContractEvent);

        (async () => {
            setCurrentStatus(await votingContract.getStatus());
        })();

        return () => {
            window.removeEventListener(CONTRACT_EVENT, handleLocallyContractEvent);
        }
    }, [votingContract, handleLocallyContractEvent]);

    return (
        <div>
            <p className="voting-status-header top-grid-area-element">Voting status</p>
            {statusLabels.map((status, index) => (
                <div className="voting-status" key={index}>
                    <p className={index === currentStatus ? "voting-status-index primary" : "voting-status-index"}>
                        {index + 1}
                    </p>
                    <p className={index === currentStatus ? "voting-status-label primary" : "voting-status-label"}>
                        {status}
                    </p>
                </div>
            ))}
        </div>

    )
}

export default VotingStatuses;