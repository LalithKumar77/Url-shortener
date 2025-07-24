import { Link } from "react-router-dom";

const NotFound=()=>{
    return (
            <div className="not-found">
                <h1>404 - URL Not Found</h1>
                <p>The URL you are Looking for does not exits or expired.</p>
                <Link to="/" className="home-link">Home</Link>
            </div>
    );
};

export default NotFound;