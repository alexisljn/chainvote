import {ChangeEvent, useCallback, useContext, useEffect, useRef, useState} from "react";
import {fireToast, formatAddressWithChecksum, getErrorMessage} from "../../utils/Utils";
import {registerVoter, startProposalsRegistration} from "../../utils/VotingUtils";
import {ChainVoteContext} from "../../App";
import {CONTRACT_EVENT} from "../../events-manager/VotingEventsManager";

function AdminVotersRegistration() {

    const {provider, votingContract, address, modal} = useContext(ChainVoteContext);

    const [voterAddress, setVoterAddress] = useState<string>("");

    const [isAddressCorrect, setIsAddressCorrect] = useState<boolean>(false)

    const registerInputRef = useRef<HTMLInputElement | null>(null);

    const onChangeVoterAddress = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        setVoterAddress(e.target.value);
    }, []);

    const onRegisterVoterClick = useCallback(async () => {
        try {
            await registerVoter(provider!, votingContract!, voterAddress);

            modal.show();
        } catch (e: any) {
            fireToast('error', getErrorMessage(e));
        }

    }, [voterAddress, provider, votingContract, modal]);

    const onStartProposalsRegistrationClick =  useCallback(async () => {
        try {
            await startProposalsRegistration(provider!, votingContract!);

            modal.show()
        } catch (e: any) {
            fireToast('error', getErrorMessage(e));
        }
    }, [provider, votingContract, modal]);

    const handleLocallyContractEvent = useCallback((e: any) => {
        switch (e.detail.type) {
            case 'voterRegistered':
                const {voterAddress, voterRegisteredCaller} = e.detail.value;
                if (voterRegisteredCaller === address) {
                    fireToast('success', `${voterAddress} is now registered as voter !`);

                    modal.hide();
                }
                break;
            case 'workflowStatusChange':
                const {workflowStatusChangeCaller} = e.detail.value;
                if (workflowStatusChangeCaller === address) {
                    fireToast('success', 'Voting status has been updated !');

                    modal.hide();
                }
                break;
        }
    }, [address, modal]);

    useEffect(() => {
        window.addEventListener(CONTRACT_EVENT, handleLocallyContractEvent);

        return () => {
            window.removeEventListener(CONTRACT_EVENT, handleLocallyContractEvent);
        }
    }, [handleLocallyContractEvent]);

    useEffect(() => {
        try {
            formatAddressWithChecksum(voterAddress);

            setIsAddressCorrect(true);
        } catch (e) {
            setIsAddressCorrect(false);
        }

    }, [voterAddress])

    return (
        <>
            <h2>Voters registration</h2>
            <div className="admin-status-steps">
                <div className="admin-status-step">
                    <div className="step-index primary">1</div>
                    <div className="register-voter">
                        <input className={!isAddressCorrect && voterAddress.length > 0
                                ? "register-voter-input invalid"
                                : "register-voter-input"
                            }
                               type="text"
                               placeholder="Voter address"
                               value={voterAddress}
                               onChange={onChangeVoterAddress}
                               ref={registerInputRef}
                        />
                        <button className="btn primary"
                                onClick={onRegisterVoterClick}
                                disabled={!isAddressCorrect}>
                            Register
                        </button>
                    </div>
                </div>
                <div className="admin-status-step">
                    <div className="step-index primary">2</div>
                    <div>
                        <button className="btn primary" onClick={onStartProposalsRegistrationClick}>
                            Start proposals registration
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default AdminVotersRegistration