import {useContext} from "react";
import {ChainVoteContext} from "../../App";

interface ProposalCardProps {
    proposal: { description: string, voteCount: number }
}

function ProposalCard({proposal}: ProposalCardProps) {

    const {permissions} = useContext(ChainVoteContext);

    const {canVote} = permissions;

    let testCanVote = true;

    return (
        <div className="card">
            <div>
                <p className="card-text">{proposal.description}</p>
                <div className="card-vote-section">
                    {testCanVote &&
                        <button className="btn card-btn primary">Vote</button>
                    }
                    <p className="card-vote-count">Vote count <span className="card-vote-badge">{proposal.voteCount}</span></p>
                </div>
            </div>
        </div>
    )
}

export default ProposalCard;