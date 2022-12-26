import {NavLink} from "react-router-dom";
import {useContext} from "react";
import {ChainVoteContext} from "../../App";

function Nav() {

    const {permissions} = useContext(ChainVoteContext);

    const {isOwner} = permissions;

    return (
        <nav className="header-nav">
            <ul className="nav-links">
                <li><NavLink to="/">Home</NavLink></li>
                <li><NavLink to="history">History</NavLink></li>
                {isOwner &&
                    <li><NavLink to="/admin">Admin</NavLink></li>
                }
            </ul>
        </nav>
    )
}

export default Nav;