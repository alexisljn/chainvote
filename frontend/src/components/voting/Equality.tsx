import CardGrid from "../common/CardGrid";
import {useCallback, useContext, useEffect, useState} from "react";
import {CONTRACT_EVENT} from "../../events-manager/VotingEventsManager";
import {getProposals, Proposal, registerItself} from "../../utils/VotingUtils";
import {ChainVoteContext} from "../../App";
import {fireToast, getErrorMessage} from "../../utils/Utils";

function Equality() {

    const {provider, votingContract, address, permissions, modal} = useContext(ChainVoteContext);

    const {canRegisterItself} = permissions;

    const [proposals, setProposals] = useState<Proposal[]>([]);

    const handleLocallyContractEvents = useCallback((e: any) => {
        switch (e.detail.type) {
            case 'voterRegistered':
                const {voterRegisteredCaller} = e.detail.value;

                if (address === voterRegisteredCaller) {
                    modal.hide();

                    fireToast('success', 'You are successfully registered as voter !');
                }
        }
    }, [address, modal]);

    const onRegisterItselfClick = useCallback(async () => {
        try {
            await registerItself(provider!, votingContract!);

            modal.show();
        } catch (e: any) {
            fireToast('error', getErrorMessage(e));
        }
    }, [provider, votingContract, modal]);

    useEffect(() => {
        window.addEventListener(CONTRACT_EVENT, handleLocallyContractEvents);

        (async () => {
            setProposals(await getProposals(votingContract!));
        })();

        return () => {
            window.removeEventListener(CONTRACT_EVENT, handleLocallyContractEvents)
        }
    }, [votingContract, handleLocallyContractEvents])

    return (
        <>
            <CardGrid proposals={proposals}/>
            <div>
                <p>Administrator will choose between creating new ballot or picking randomly a winner</p>
            {canRegisterItself &&
                <div className="register-itself">
                    <p>If you have already voted you need to register yourself for next ballot</p>
                    <button className="btn primary" onClick={onRegisterItselfClick}>Register</button>
                </div>
            }
            </div>
        </>
    )
}

export default Equality;