import {useCallback, useContext} from "react";
import {ChainVoteContext} from "../../App";
import {connectWallet} from "../../utils/ProviderUtils";
import {formatAddressWithChecksum} from "../../utils/Utils";

function UserInfo() {

    const {provider, chainId, address, changeAddress} = useContext(ChainVoteContext);

    const onConnectWalletClick = useCallback(async () => {
        try {
            const address = await connectWallet(provider!);

            changeAddress(formatAddressWithChecksum(address));
        }  catch (e) {
            console.error(e); // Logging for user
        }
    }, [changeAddress, provider]);

    if (!provider || !chainId) return (<></>);

    if (provider && !address) {
        return (
            <button className="btn primary" onClick={onConnectWalletClick}>Connect wallet</button>
        )
    }

    return (
        <div>
            <p>{chainId}</p>
            <p>{address}</p>
        </div>

    )

}

export default UserInfo;