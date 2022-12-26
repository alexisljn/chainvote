import {useContext, useEffect, useState} from "react";
import {ChainVoteContext} from "../../App";
import {generateStatusesList} from "../../utils/VotingUtils";

function VotingStatuses() {

    const {votingContract} = useContext(ChainVoteContext);

    const [currentStatus, setCurrentStatus] = useState<number | null>(null);

    const [statuses, setStatuses] = useState<string[]>([]);

    useEffect(() => {
        if (!votingContract) return;

        (async () => {
            setCurrentStatus(await votingContract.getStatus());
        })();
    }, [votingContract]);

    useEffect(() => {
        if (currentStatus === null) return;

        setStatuses(generateStatusesList(currentStatus));
    }, [currentStatus]);

    return (
        <div>
            <p className="voting-status-header top-grid-area-element">Voting status</p>
            {statuses.map((status, index) => (
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