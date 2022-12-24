import {providers} from "ethers";

const supportedChains = {
    goerli: 5,
    hardhat: 31337
};

async function connectWallet(provider: providers.Web3Provider): Promise<string> {
    const accounts: string[] = await provider.send("eth_requestAccounts", []);

    if (accounts.length === 0) {
        throw new Error('No accounts found')
    }

    return accounts[0];
}

async function getConnectedAccounts(provider: providers.Web3Provider): Promise<string | null> {
    const accounts: string[] = await provider.send("eth_accounts", []);

    if (accounts.length > 0) {
        return accounts[0];
    }

    return null;
}

function isChainIdSupported(chainId: number): boolean {
    return parseInt(process.env.REACT_APP_CHAIN_ID!) === chainId;
}

function getSupportedChainLabel(chainId: number): string {
    const index = Object.values(supportedChains).findIndex((chain: number) => chain === chainId);

    return Object.keys(supportedChains)[index];
}

export {connectWallet, getConnectedAccounts, isChainIdSupported, getSupportedChainLabel, getChainLabel}