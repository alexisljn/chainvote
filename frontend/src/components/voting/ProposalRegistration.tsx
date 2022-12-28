import CardGrid from "../common/CardGrid";
import {useContext, useEffect, useState} from "react";
import {ChainVoteContext} from "../../App";



function ProposalRegistration() {

    const {votingContract} = useContext(ChainVoteContext);

    const [proposals, setProposals] = useState<any>([]);

    useEffect(() => {
        if (!votingContract) return

        const fixtures = [
            {description: 'Fixture 1', voteCount: 0},
            {description: 'Fixture 2', voteCount: 0},
            {description: 'Fixture 3', voteCount: 0},
            {description: 'Fixture 4', voteCount: 0},
            {description: 'Fixture 5', voteCount: 0}
        ];

        setProposals(fixtures);

    }, [votingContract])

    return (
        <>
            <CardGrid proposals={proposals}/>
            <div>
                <h2>Add a proposal</h2>
                <div>
                    <textarea className="proposal-textarea"
                              placeholder="Proposal description"
                              cols={100}
                              rows={10}></textarea>
                </div>
                <button className="btn primary">Add proposal</button>
            </div>
        </>
    )
}

export default ProposalRegistration;