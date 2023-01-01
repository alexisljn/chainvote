import {ethers} from "ethers";
import Swal from 'sweetalert2';

function formatAddressWithChecksum(address: string) {
    return ethers.utils.getAddress(address);
}

function shortenAddress(address: string) {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

type toastType = "success" | "error" | "warning"

function fireToast(type: toastType, text: string) {
    const bgColor: {[key: string]: string} = {success: '#28a745', error: '#dc3545', warning: '#ffc107'};

    const textColor = {success: 'white', error: 'white', warning: '#343a40'};

    Swal.fire({
        title: text,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        background: bgColor[type],
        color: textColor[type]
    });
}

function getErrorMessage(error: any) {
    if (!error.hasOwnProperty('error')) {
        return error.message;
    }

    let errorMessage = error.error.data.message.match(/'.+'/)[0];

    return errorMessage.slice(1, errorMessage.length - 1);
}

export {formatAddressWithChecksum, shortenAddress, fireToast, getErrorMessage}