import {useContext, useEffect, useState} from "react";
import {ChainVoteContext} from "../../App";

function Admin() {

    const {permissions} = useContext(ChainVoteContext);

    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const {isOwner} = permissions;

        if (!isOwner) {
            window.location.replace('/unauthorized');
            return;
        }

        setIsLoading(false);
    }, [permissions])

    if (isLoading) {
        return (
            <p>Loading...</p>
        )
    }

    return (
        <p>Admin</p>
    )
}

export default Admin;