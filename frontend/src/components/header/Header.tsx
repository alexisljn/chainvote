import Logo from "./Logo";
import Nav from "./Nav";
import UserInfo from "./UserInfo";

function Header() {
    return (
        <>
            <div className="header-links">
                <Logo/>
                <Nav/>
            </div>
            <div>
                <UserInfo/>
            </div>
        </>
    )
}

export default Header;