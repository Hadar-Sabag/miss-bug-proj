const { Link } = ReactRouterDOM
const { Fragment } = React

import { BugPreview } from './BugPreview.jsx'
import { authService } from "../services/auth.service.js";

export function BugList({ bugs, onRemoveBug, onEditBug }) {

    const loggedInUser = authService.getLoggedinUser()
    function isAllowed(bug) {
        if (!loggedInUser) return false
        if (loggedInUser.isAdmin ||
            loggedInUser._id === bug.creator._id) {
            return true
        }
        return false
    }

    if (!bugs) return <div>Loading...</div>

    return <ul className="bug-list">
        {bugs.map(bug => (
            <li key={bug._id}>
                <BugPreview bug={bug} />
                <section className="actions">
                    <button><Link to={`/bug/${bug._id}`}>Details</Link></button>
                    {
                        isAllowed(bug) &&
                        <Fragment>
                            <button onClick={() => onEditBug(bug)}>Edit</button>
                            <button onClick={() => onRemoveBug(bug._id)}>x</button>
                        </Fragment>
                    }
                </section>
            </li>
        ))}
    </ul >
}
