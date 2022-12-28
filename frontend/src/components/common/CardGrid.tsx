import ProposalCard from "./ProposalCard";

interface CardGridProps {
    proposals: {description: string, voteCount: number}[]
}

function CardGrid({proposals}: CardGridProps) {
    return (
        <div className="card-grid">
            {proposals.map((proposal: any, index: number) => (
                <ProposalCard proposal={proposal} key={index}/>
            ))}
        </div>
    )
}

export default CardGrid;