import CardGrid from "../common/CardGrid";
import {ChangeEvent, useCallback, useContext, useEffect, useState} from "react";
import {ChainVoteContext} from "../../App";
import {addProposal, getProposals} from "../../utils/VotingUtils";
import {CONTRACT_EVENT} from "../../events-manager/VotingEventsManager";
import {fireToast} from "../../utils/Utils";

function ProposalRegistration() {

    const {provider, votingContract, address, modal, permissions} = useContext(ChainVoteContext);

    const {canAddProposal} = permissions;

    const [proposals, setProposals] = useState<any>([]);

    const [submittedProposal, setSubmittedProposal] = useState<string>('');

    const onSubmittedProposalChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) =>{
       setSubmittedProposal(e.target.value);
    }, [])

    const onAddProposalClick = useCallback(async () => {
        await addProposal(provider!, votingContract!, submittedProposal);

        modal.show();

        setSubmittedProposal('');
    }, [submittedProposal, provider, votingContract, modal]);

    const handleLocallyContractEvent = useCallback(async (e: any) => {
        switch (e.detail.type) {
            case 'proposalRegistered':
                const {proposalRegisteredCaller} = e.detail.value;

                if (address === proposalRegisteredCaller) {
                    modal.hide();

                    fireToast('success', 'Your proposal has been submitted !');

                    setProposals(await getProposals(votingContract!));
                }

                break;
        }
    }, [votingContract, address, modal]);


    useEffect(() => {
        window.addEventListener(CONTRACT_EVENT, handleLocallyContractEvent);

        (async () => {
            setProposals(await getProposals(votingContract!));
        })();

        return () => {
            window.removeEventListener(CONTRACT_EVENT, handleLocallyContractEvent);
        }

    }, [votingContract, handleLocallyContractEvent]);

    return (
        <>
            <CardGrid proposals={proposals}/>
            {canAddProposal &&
                <div>
                    <h2>Add a proposal</h2>
                    <div>
                        <textarea className="proposal-textarea"
                                  placeholder="Proposal description"
                                  cols={100}
                                  rows={10}
                                  value={submittedProposal}
                                  onChange={onSubmittedProposalChange}></textarea>
                    </div>

                        <button className="btn primary" onClick={onAddProposalClick} disabled={submittedProposal.length === 0}>
                            Add proposal
                        </button>
                </div>
            }
        </>
    )
}

export default ProposalRegistration;