import ProposalCard from "./ProposalCard";
import {Proposal} from "../../utils/VotingUtils";

interface CardGridProps {
    proposals: Proposal[]
}

function CardGrid({proposals}: CardGridProps) {

    if (proposals.length === 0) {
        return (
            <div>
                <p>There is currently no proposal</p>
            </div>
        )
    }

    return (
        <div className="card-grid">
            {proposals.map((proposal: any, index: number) => (
                <ProposalCard proposal={proposal} key={index}/>
            ))}
        </div>
    )
}

export default CardGrid;