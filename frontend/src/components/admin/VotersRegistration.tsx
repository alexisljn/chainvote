import {ChangeEvent, useCallback, useEffect, useRef, useState} from "react";
import {formatAddressWithChecksum} from "../../utils/Utils";

function VotersRegistration() {

    const [voterAddress, setVoterAddress] = useState<string>("");

    const [isAddressCorrect, setIsAddressCorrect] = useState<boolean>(false)

    const registerInputRef = useRef<HTMLInputElement | null>(null);

    const onChangeVoterAddress = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        setVoterAddress(e.target.value);
    }, []);

    const onRegisterVoterClick = useCallback(() => {

    }, [voterAddress]);

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
                        <button className="btn primary" disabled={!isAddressCorrect}>Register</button>
                    </div>
                </div>
                <div className="admin-status-step">
                    <div className="step-index primary">2</div>
                    <div className="">
                        <button className="btn primary">Start proposals registration</button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default VotersRegistration