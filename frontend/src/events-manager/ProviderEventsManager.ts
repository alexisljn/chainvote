import {MetaMaskInpageProvider} from "@metamask/providers";
import {ExternalProvider} from "@ethersproject/providers";

const PROVIDER_EVENT = "providerEvent"

function listenProviderEvents(provider: ExternalProvider & MetaMaskInpageProvider) {
    provider.on("chainChanged", onChainChangedHandler);
}

function cleanProviderEvents(provider: ExternalProvider & MetaMaskInpageProvider) {
    provider.removeListener("chainChanged", onChainChangedHandler);
}

function onChainChangedHandler(chainId: any) {
    console.log("typeof chainId", typeof chainId, parseInt(chainId), chainId);

    const event = new CustomEvent(PROVIDER_EVENT, {detail: {type: "chainChanged", value: parseInt(chainId)}});

    window.dispatchEvent(event);
}

export {listenProviderEvents, cleanProviderEvents, PROVIDER_EVENT}