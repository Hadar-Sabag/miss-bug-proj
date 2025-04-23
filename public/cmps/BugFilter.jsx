const { useState, useEffect } = React

const LABELS = ['critical', 'need-CR', 'dev-branch', 'UI', 'backend']

export function BugFilter({ filterBy, onSetFilterBy }) {

    const [filterByToEdit, setFilterByToEdit] = useState(filterBy)

    useEffect(() => {
        onSetFilterBy(filterByToEdit)
    }, [filterByToEdit])

    function handleChange({ target }) {
        const field = target.name
        let value = target.value

        switch (target.type) {
            case 'number':
            case 'range':
                value = +value || ''
                break

            case 'checkbox':
                if (field === 'labels') {
                    const label = target.value
                    const labels = filterByToEdit.labels || []
                    value = target.checked
                        ? [...labels, label]
                        : labels.filter(currLabel => currLabel !== label)
                    setFilterByToEdit(prev => ({ ...prev, labels: value }))
                    return
                }
                value = target.checked
                break

            default:
                break
        }

        setFilterByToEdit(prevFilter => ({ ...prevFilter, [field]: value }))
    }

    function onSubmitFilter(ev) {
        ev.preventDefault()
        onSetFilterBy(filterByToEdit)
    }

    const { txt, minSeverity, labels = [] } = filterByToEdit

    return (
        <section className="bug-filter">
            <h2>Filter</h2>
            <form onSubmit={onSubmitFilter}>
                <label htmlFor="txt">Text: </label>
                <input value={txt} onChange={handleChange} type="text" placeholder="By Text" id="txt" name="txt" />

                <label htmlFor="minSeverity">Min Severity: </label>
                <input value={minSeverity} onChange={handleChange} type="number" placeholder="By Min Severity" id="minSeverity" name="minSeverity" />

                <fieldset>
                    <legend>Labels:</legend>
                    {LABELS.map(label => (
                        <label key={label}>
                            <input
                                type="checkbox"
                                name="labels"
                                value={label}
                                checked={labels.includes(label)}
                                onChange={handleChange}
                            />
                            {label}
                        </label>
                    ))}
                </fieldset>
            </form>
        </section>
    )
}