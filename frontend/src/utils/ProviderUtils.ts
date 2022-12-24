import {providers} from "ethers";

async function connectWallet(provider: providers.Web3Provider): Promise<string> {
    const accounts: string[] = await provider.send("eth_requestAccounts", []);

    if (accounts.length === 0) {
        throw new Error('No accounts found')
    }

    return accounts[0];
}

export {connectWallet}