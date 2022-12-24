import {ethers} from "ethers";

function formatAddressWithChecksum(address: string) {
    return ethers.utils.getAddress(address);
}

function shortenAddress(address: string) {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
}


export {formatAddressWithChecksum, shortenAddress}