import CardGrid from "../common/CardGrid";
import {useContext, useEffect, useState} from "react";
import {ChainVoteContext} from "../../App";
import {getProposals, Proposal} from "../../utils/VotingUtils";

function ProposalRegistrationEnded() {

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
            <p>Administrator hasn't started voting session yet</p>
        </>
    )
}

export default ProposalRegistrationEnded;