import {useContext, useEffect, useState} from "react";
import {ChainVoteContext} from "../../App";
import {getWinningProposal, Proposal} from "../../utils/VotingUtils";
import CardGrid from "../common/CardGrid";

function VotesTallied() {

    const {votingContract} = useContext(ChainVoteContext);

    const [winningProposal, setWinningProposal] = useState<Proposal | null>(null);

    useEffect(() => {
        (async () => {
            setWinningProposal(await getWinningProposal(votingContract!))
        })();

    }, [votingContract]);

    if (!winningProposal) {
        return (
            <p>Loading...</p>
        )
    }

    return (
        <>
            <h2>Winning proposal</h2>
            <CardGrid proposals={[winningProposal]}></CardGrid>
            <p>Votes has been tallied. This voting session is over.</p>
        </>
    );

}

export default VotesTallied;