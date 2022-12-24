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
            <p>{`Statuses - ${currentStatus}`}</p>
            {statuses.map((status, index) => (
                <div key={index}>
                    <p>{index + 1}</p>
                    <p>{status}</p>
                </div>
            ))}
        </div>

    )
}

export default VotingStatuses;