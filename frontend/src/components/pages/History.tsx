import {useContext, useEffect, useState} from "react";
import {getWinningProposalsHistory, Proposal} from "../../utils/VotingUtils";
import {ChainVoteContext} from "../../App";
import CardGrid from "../common/CardGrid";

function History() {

    const {votingContract} = useContext(ChainVoteContext);

    const [winningProposalsHistory, setWinningProposalsHistory] = useState<Proposal[]>([]);

    useEffect(() => {
        if (!votingContract) return;

        (async () => {
            setWinningProposalsHistory(await getWinningProposalsHistory(votingContract));
        })();

    }, [votingContract]);

    if (!votingContract) {
        return (
            <p>Loading...</p>
        )
    }

    return (
        <div>
            <h1 className="top-grid-area-element">Winning proposals history</h1>
            {winningProposalsHistory.length > 0
                ?
                    <CardGrid proposals={winningProposalsHistory}/>
                :
                    <p>There is currently no proposal in history</p>
            }
        </div>
    )
}

export default History;