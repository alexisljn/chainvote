import {useCallback, useContext, useEffect, useState} from "react";
import {ChainVoteContext} from "../../App";
import {Proposal, vote} from "../../utils/VotingUtils";
import {useLocation} from "react-router-dom";
import {fireToast, getErrorMessage} from "../../utils/Utils";

interface ProposalCardProps {
    proposal: Proposal
    index: number
}

function ProposalCard({proposal, index}: ProposalCardProps) {

    const {provider, votingContract, permissions, modal} = useContext(ChainVoteContext);

    const [isAdminPage, setIsAdminPage] = useState<boolean>(false);

    const location = useLocation();

    const onVoteClick = useCallback(async () => {
        try {
            await vote(provider!, votingContract!, index);

            modal.show();
        } catch (e) {
            fireToast('error', getErrorMessage(e));
        }
    }, [provider, votingContract, modal]);

    useEffect(() => {
        setIsAdminPage(location.pathname.includes('admin'))
    }, [location]);

    const {canVote} = permissions;

    return (
        <div className="card">
            <p className="card-text">{proposal.description}</p>
            <div className="card-vote-section">
                {(canVote && !isAdminPage) &&
                    <button className="btn card-btn primary" onClick={onVoteClick}>Vote</button>
                }
                <p className="card-vote-count">Vote count <span className="card-vote-badge">{proposal.voteCount.toString()}</span></p>
            </div>
        </div>
    )
}

export default ProposalCard;