
import Logo from "./Logo";
import Nav from "./Nav";
function Header() {
        return (
            <div className="header">
                <div className="header-links">
                    <Logo/>
                    <Nav/>
                </div>
                <div className="header-connect">
                    <button className="btn primary">Connect wallet</button>
                </div>
            </div>
        )
}

export default Header;