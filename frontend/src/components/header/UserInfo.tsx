import {useCallback, useContext} from "react";
import {ChainVoteContext} from "../../App";
import {connectWallet, getChainLabel} from "../../utils/ProviderUtils";
import {formatAddressWithChecksum, shortenAddress} from "../../utils/Utils";

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
        <div className="user-info">
            <p className="user-network network">{getChainLabel(provider.network)}</p>
            <p className="user-address">{shortenAddress(address!)}</p>
        </div>

    )

}

export default UserInfo;