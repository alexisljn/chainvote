import {useContext, useEffect, useState} from "react";
import {ChainVoteContext} from "../../App";
import {Proposal} from "../../utils/VotingUtils";
import {useLocation} from "react-router-dom";

interface ProposalCardProps {
    proposal: Proposal
}

function ProposalCard({proposal}: ProposalCardProps) {

    const {permissions} = useContext(ChainVoteContext);

    const [isAdminPage, setIsAdminPage] = useState<boolean>(false);

    const location = useLocation();

    useEffect(() => {
        setIsAdminPage(location.pathname.includes('admin'))
    }, [location]);

    const {canVote} = permissions;

    return (
        <div className="card">
            <p className="card-text">{proposal.description}</p>
            <div className="card-vote-section">
                {(canVote && !isAdminPage) &&
                    <button className="btn card-btn primary">Vote</button>
                }
                <p className="card-vote-count">Vote count <span className="card-vote-badge">{proposal.voteCount.toString()}</span></p>
            </div>
        </div>
    )
}

export default ProposalCard;