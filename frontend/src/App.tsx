import React, {createContext, useCallback, useEffect, useState} from 'react';
import Header from "./components/header/Header";
import {Route, Routes} from "react-router-dom";
import Voting from "./components/pages/Voting";
import Error from "./components/pages/Error";
import History from "./components/pages/History";
import Admin from "./components/pages/Admin";
import {Contract, providers} from "ethers";
import {
    cleanProviderEvents,
    listenProviderEvents,
    PROVIDER_EVENT
} from "./events-manager/ProviderEventsManager";
import {getSupportedChainLabel, getConnectedAccounts, isChainIdSupported} from "./utils/ProviderUtils";
import {ContractPermissions, getContractPermissions, getVotingContractInstance,} from "./utils/VotingUtils";
import VotingStatuses from "./components/sidebar/VotingStatuses";
import {formatAddressWithChecksum} from "./utils/Utils";
import Modal from "./components/common/Modal";
import {cleanContractEvents, CONTRACT_EVENT, listenContractEvents} from "./events-manager/VotingEventsManager";

interface ChainVoteContextInterface {
    provider: providers.Web3Provider | undefined | null;
    votingContract: Contract | null;
    address: string | null;
    chainId: number | null;
    changeAddress: (address: string | null) => void;
    permissions: ContractPermissions
    modal: {show: () => void, hide: () => void};
}

const ChainVoteContext = createContext<ChainVoteContextInterface>({
    provider: undefined,
    votingContract: null,
    address: null,
    chainId: null,
    changeAddress: () => {},
    permissions: {
        isOwner: false,
        canAddProposal: false,
        canVote: false,
        canRegisterItself: false,
    },
    modal: {show: () => {}, hide: () => {}},
});
function App() {

    const [provider, setProvider] = useState<providers.Web3Provider | undefined | null>(undefined);

    const [address, setAddress] = useState<string | null>(null);

    const [chainId, setChainId] = useState<number | null>(null);

    const [votingContract, setVotingContract] = useState<Contract | null>(null);

    const [permissions, setPermissions] = useState<ContractPermissions>({
        isOwner: false,
        canAddProposal: false,
        canVote: false,
        canRegisterItself: false,
    });

    const [isLoading, setIsLoading] = useState<boolean>(true);

    const [showModal, setShowModal] = useState<boolean>(false);

    const displayModal = useCallback(() => {
        setShowModal(true);
    }, []);

    const hideModal = useCallback(() => {
        setShowModal(false);
    }, []);

    const handleLocallyProviderEvents = useCallback((e: any) => {
        switch (e.detail.type) {
            case "chainChanged":
                window.location.reload();
                break;
            case "accountsChanged":
                setAddress(e.detail.value);
                break;
        }
    }, []);

    const handleLocallyContractEvents = useCallback(async (e: any) => {
        switch (e.detail.type) {
            case 'workflowStatusChange':
                setPermissions(await getContractPermissions(votingContract!, address!));
                break;
        }
    }, [votingContract, address]);

    const changeAddress = useCallback((address: string | null) => {
        setAddress(address);
    }, []);

    useEffect(() => {
        if (window.ethereum) {
            const web3Provider = new providers.Web3Provider(window.ethereum);

            setProvider(web3Provider);

            listenProviderEvents(window.ethereum);

            window.addEventListener(PROVIDER_EVENT, handleLocallyProviderEvents);

            return () => {
                cleanProviderEvents(window.ethereum);

                window.removeEventListener(PROVIDER_EVENT, handleLocallyProviderEvents);
            }
        } else {
            setProvider(null);
        }

    }, [handleLocallyProviderEvents]);

    useEffect(() => {
        if (!provider) return;

        (async () => {
            setChainId((await provider.getNetwork()).chainId);

            const connectedAccount = await getConnectedAccounts(provider);

            connectedAccount !== null
                ? setAddress(formatAddressWithChecksum(connectedAccount))
                : setAddress(connectedAccount)
            ;

            setVotingContract(getVotingContractInstance(provider));
        })()
    }, [provider]);

    useEffect(() => {
        if (!votingContract || !address || !chainId) return;

        if (!isChainIdSupported(chainId)) return;

        listenContractEvents(votingContract);

        window.addEventListener(CONTRACT_EVENT, handleLocallyContractEvents);

        (async () => {
            setPermissions(await getContractPermissions(votingContract, address));
            setIsLoading(false);
        })();

        return () => {
            cleanContractEvents(votingContract);

            window.removeEventListener(CONTRACT_EVENT, handleLocallyContractEvents);
        }
    }, [votingContract, address, chainId, handleLocallyContractEvents]);


    if (provider === null) {
        return (
            <div className="grid">
                <div className="header">
                    <Header/>
                </div>
                <div className="sidebar"></div>
                <div className="content">
                    <p>Please install metamask</p>
                </div>
            </div>
        )
    }

    if (provider === undefined || isLoading) {
        return (
            <div className="grid">
                <div className="header">
                    <Header/>
                </div>
                <div className="sidebar"></div>
                <div className="content">
                    <p>Loading...</p>
                </div>
            </div>
        )
    }

    if (!isChainIdSupported(chainId!)) {
        return (
            <ChainVoteContext.Provider value={{provider, votingContract, address, chainId, changeAddress, permissions, modal: {show: displayModal, hide: hideModal}}}>
                <div className="grid">
                    <div className="header">
                        <Header/>
                    </div>
                    <div className="sidebar"></div>
                    <div className="content">
                        <p>Switch on <span className="network">{getSupportedChainLabel(parseInt(process.env.REACT_APP_CHAIN_ID!))}</span></p>
                    </div>
                </div>
            </ChainVoteContext.Provider>
        )
    }

    return (
        <ChainVoteContext.Provider value={{provider, votingContract, address, chainId, changeAddress, permissions, modal: {show: displayModal, hide: hideModal}}}>
            {showModal &&
                <Modal/>
            }
            <div className="grid">
                <div className="header">
                    <Header/>
                </div>
                <div className="sidebar">
                    <VotingStatuses/>
                </div>
                <div className="content">
                    <Routes>
                        <Route path="/" element={<Voting/>}/>
                        <Route path="history" element={<History/>}/>
                        <Route path="admin" element={<Admin/>}/>
                        <Route path="*" element={<Error/>}/>
                    </Routes>
                </div>
            </div>
        </ChainVoteContext.Provider>
    );
}

export {App, ChainVoteContext};
