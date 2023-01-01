import CardGrid from "../common/CardGrid";
import {useContext, useEffect, useState} from "react";
import {ChainVoteContext} from "../../App";
import {getProposals, Proposal} from "../../utils/VotingUtils";

interface PeriodEndedProps {
    period: "proposal" | "voting"
}
function PeriodEnded({period}: PeriodEndedProps) {

    const {votingContract} = useContext(ChainVoteContext);

    const [proposals, setProposals] = useState<Proposal[]>([]);

    useEffect(() => {
        (async () => {
            setProposals(await getProposals(votingContract!));
        })()
    }, [votingContract]);


    return (
        <>
            <CardGrid proposals={proposals}/>
            {period === "proposal"
                ?
                <p>Administrator hasn't started voting session yet</p>
                :
                <p>Administrator hasn't tallied votes yet</p>
            }

        </>
    )
}

export default PeriodEnded;