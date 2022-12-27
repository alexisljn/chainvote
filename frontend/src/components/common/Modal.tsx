import Spinner from "./Spinner";
import {useContext} from "react";
import {ChainVoteContext} from "../../App";

function Modal() {

    const {modal} = useContext(ChainVoteContext);

    const {hide} = modal;

    return (
        <>
            <div className="modal-background">
                <div className="modal">
                    <div className="modal-header">
                        <p className="modal-title">Transaction in progress</p>
                        <button className="modal-cross" onClick={hide}>╳</button>
                    </div>
                    <div className="modal-spinner"><Spinner/></div>
                    <p className="modal-text">This modal will close automatically when transaction will be confirmed.</p>
                </div>
            </div>

        </>
    )
}

export default Modal;