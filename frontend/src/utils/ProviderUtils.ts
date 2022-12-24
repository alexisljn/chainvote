import {providers} from "ethers";

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

export {connectWallet, getConnectedAccounts}