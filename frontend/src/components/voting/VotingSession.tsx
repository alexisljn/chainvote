import CardGrid from "../common/CardGrid";
import {useCallback, useContext, useEffect, useState} from "react";
import {ChainVoteContext} from "../../App";
import {getProposals, Proposal} from "../../utils/VotingUtils";
import {CONTRACT_EVENT} from "../../events-manager/VotingEventsManager";
import {fireToast} from "../../utils/Utils";

function VotingSession() {

    const {votingContract, address, modal} = useContext(ChainVoteContext);

    const [proposals, setProposals] = useState<Proposal[]>([]);

    const handleLocallyContractEvents = useCallback(async (e: any) => {
        switch (e.detail.type) {
            case 'voted':
                const {votedCaller} = e.detail.value;

                if (address === votedCaller) {
                    modal.hide();

                    fireToast('success', 'Your vote has been submitted !');
                }

                setProposals(await getProposals(votingContract!));

                break;
        }
    }, [votingContract, address, modal]);


    useEffect(() => {
        window.addEventListener(CONTRACT_EVENT, handleLocallyContractEvents);

        (async () => {
            setProposals(await getProposals(votingContract!));
        })();

        return () => {
            window.removeEventListener(CONTRACT_EVENT, handleLocallyContractEvents);
        }
    }, [votingContract, handleLocallyContractEvents]);

    return (
        <>
            <h2>Pick your favorite proposal</h2>
            <CardGrid proposals={proposals}/>
        </>
    )
}

export default VotingSession;