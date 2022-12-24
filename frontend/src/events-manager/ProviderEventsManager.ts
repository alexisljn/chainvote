import {MetaMaskInpageProvider} from "@metamask/providers";
import {ExternalProvider} from "@ethersproject/providers";
import {formatAddressWithChecksum} from "../utils/Utils";

const PROVIDER_EVENT = "providerEvent"

function listenProviderEvents(provider: ExternalProvider & MetaMaskInpageProvider) {
    provider.on("chainChanged", onChainChangedHandler);

    provider.on("accountsChanged", onAccountsChangedHandler);
}

function cleanProviderEvents(provider: ExternalProvider & MetaMaskInpageProvider) {
    provider.off("chainChanged", onChainChangedHandler);

    provider.off("accountsChanged", onAccountsChangedHandler);
}

function onChainChangedHandler(chainId: any) {
    const event = new CustomEvent(PROVIDER_EVENT, {detail: {type: "chainChanged", value: parseInt(chainId)}});

    window.dispatchEvent(event);
}

function onAccountsChangedHandler(address: any) {
    let newAddress = null;

    if (address.length > 0) {
        newAddress = formatAddressWithChecksum(String(address[0]));
    }

    const event = new CustomEvent(PROVIDER_EVENT, {detail: {type: "accountsChanged", value: newAddress}});

    window.dispatchEvent(event);
}

export {listenProviderEvents, cleanProviderEvents, PROVIDER_EVENT}