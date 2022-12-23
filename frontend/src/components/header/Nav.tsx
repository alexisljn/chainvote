import {NavLink} from "react-router-dom";

function Nav() {
    return (
        <nav className="header-nav">
            <ul className="nav-links">
                <li><NavLink to="/">Home</NavLink></li>
                <li><NavLink to="history">History</NavLink></li>
                <li><NavLink to="/admin">Admin</NavLink></li>
            </ul>
        </nav>
    )
}

export default Nav;