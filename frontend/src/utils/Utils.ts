import {ethers} from "ethers";

function formatAddressWithChecksum(address: string) {
    return ethers.utils.getAddress(address);
}

export {formatAddressWithChecksum}