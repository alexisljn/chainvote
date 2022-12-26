import React, {createContext, useCallback, useEffect, useState} from 'react';
import Header from "./components/header/Header";
import {Route, Routes} from "react-router-dom";
import Home from "./components/pages/Home";
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
import {canRegisterItself, canVote, getVotingContractInstance, isOwner} from "./utils/VotingUtils";
import VotingStatuses from "./components/sidebar/VotingStatuses";
import {formatAddressWithChecksum} from "./utils/Utils";

interface ChainVoteContextInterface {
    provider: providers.Web3Provider | undefined | null;
    votingContract: Contract | null;
    address: string | null;
    chainId: number | null;
    changeAddress: (address: string | null) => void;
    permissions: {isOwner: boolean, canVote: boolean, canRegisterItself: boolean};
}

const ChainVoteContext = createContext<ChainVoteContextInterface>({
    provider: undefined,
    votingContract: null,
    address: null,
    chainId: null,
    changeAddress: () => {},
    permissions: {
        isOwner: false,
        canVote: false,
        canRegisterItself: false,
    },
});
function App() {

    const [provider, setProvider] = useState<providers.Web3Provider | undefined | null>(undefined);

    const [address, setAddress] = useState<string | null>(null);

    const [chainId, setChainId] = useState<number | null>(null);

    const [votingContract, setVotingContract] = useState<Contract | null>(null);

    const [permissions, setPermissions] = useState({
        isOwner: false,
        canVote: false,
        canRegisterItself: false,
    });

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

            setPermissions(prevState => ({...prevState, ...{canVote: true}}));
        })()
    }, [provider]);

    useEffect(() => {
        if (!votingContract || !address || !chainId) return;

        if (!isChainIdSupported(chainId)) return;

        (async () => {
            const isUserOwner = await isOwner(votingContract, address);
            const canUserVote = await canVote(votingContract);
            const canUserRegisterItself = await canRegisterItself(votingContract);

            setPermissions({isOwner: isUserOwner, canVote: canUserVote, canRegisterItself: canUserRegisterItself});
        })()
    }, [votingContract, address, chainId])


    if (provider === undefined) {
        //TODO Style message
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

    if (provider === null) {
        //TODO Style message
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

    if (!isChainIdSupported(chainId!)) {
        //TODO Style message
        return (
            <ChainVoteContext.Provider value={{provider, votingContract, address, chainId, changeAddress, permissions}}>
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
        <ChainVoteContext.Provider value={{provider, votingContract, address, chainId, changeAddress, permissions}}>
        <div className="grid">
            <div className="header">
                <Header/>
            </div>
            <div className="sidebar">
                <VotingStatuses/>
            </div>
            <div className="content">
                <Routes>
                    <Route path="/" element={<Home/>}/>
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
