import fs from 'fs'
import { utilService } from "./util.service.js";

const bugs = utilService.readJsonFile('data/bugs.json')

export const bugService = {
    query,
    getById,
    remove,
    save
}

function query(filterBy = {}) {
    let bugToDisplay = bugs

    const total = bugToDisplay.length

    //filter by txt
    if (filterBy.txt) {
        const regExp = new RegExp(filterBy.txt, 'i')
        bugToDisplay = bugToDisplay.filter(bug => regExp.test(bug.title))
    }
    //filer by severity
    if (filterBy.minSeverity) {
        bugToDisplay = bugToDisplay.filter(bug => bug.severity >= filterBy.minSeverity)
    }
    //filter by labels
    if (filterBy.labels && filterBy.labels.length) {
        bugToDisplay = bugToDisplay.filter(bug =>
            bug.labels &&
            bug.labels.some(function (label) {
                return filterBy.labels.includes(label)
            })
        )
    }
    console.log("bugToDisplay: ", bugToDisplay.length)

    //sort
    if (filterBy.sortBy) {
        bugToDisplay.sort((a, b) => {
            const field = filterBy.sortBy
            const dir = filterBy.sortDir
            if (typeof a[field] === 'string') {
                return a[field].localeCompare(b[field]) * dir
            } else {
                return (a[field] - b[field]) * dir
            }
        })
    }

    // Paging
    const PAGE_SIZE = 3
    const startIdx = filterBy.pageIdx * PAGE_SIZE
    bugToDisplay = bugToDisplay.slice(startIdx, startIdx + PAGE_SIZE)

    return Promise.resolve({ bugs: bugToDisplay, total })
}

function getById(bugId) {
    const bug = bugs.find(bug => bug._id === bugId)
    if (!bug) return Promise.reject('Cannot find bug - ' + bugId)
    return Promise.resolve(bug)
}

function remove(bugId) {
    const bugIdx = bugs.findIndex(bug => bug._id === bugId)
    if (bugIdx === -1) return Promise.reject('Cannot remove bug - ' + bugId)
    bugs.splice(bugIdx, 1)
    return _saveBugsToFile()
}

function save(bugToSave) {
    if (bugToSave._id) {
        const bugIdx = bugs.findIndex(bug => bug._id === bugToSave._id)
        bugs[bugIdx] = bugToSave
    } else {
        bugToSave._id = utilService.makeId()
        bugToSave.createdAt = Date.now()
        bugToSave.labels = bugToSave.labels || ['critical', 'need-CR', 'dev-branch']
        bugs.push(bugToSave)
    }

    return _saveBugsToFile().then(() => bugToSave)
}


function _saveBugsToFile() {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(bugs, null, 4)
        fs.writeFile('data/bugs.json', data, (err) => {
            if (err) return reject(err)
            resolve()
        })
    })
}

