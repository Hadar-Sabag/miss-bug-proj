export function BugSort({ filterBy, onSetFilterBy }) {

    function handleSortByChange(ev) {
        const sortBy = ev.target.value
        onSetFilterBy({ sortBy })
    }

    function handleSortDirChange(ev) {
        const sortDir = +ev.target.value
        onSetFilterBy({ sortDir })
    }

    return (
        <section className="bug-sort">
            <label>Sort by:</label>
            <select value={filterBy.sortBy} onChange={handleSortByChange}>
                <option value="">None</option>
                <option value="title">Title</option>
                <option value="severity">Severity</option>
                <option value="createdAt">Created At</option>
            </select>

            <label>Direction:</label>
            <select value={filterBy.sortDir || 1} onChange={handleSortDirChange}>
                <option value="1">Ascending ↑</option>
                <option value="-1">Descending ↓</option>
            </select>
        </section>
    )
}

