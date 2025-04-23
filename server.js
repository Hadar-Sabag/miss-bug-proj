import express from 'express'
import { bugService } from './services/bug.service.server.js'
import cookieParser from 'cookie-parser'
import path from 'path'

const app = express()

//* Express Config:
app.use(express.static('public'))
app.use(cookieParser())
app.use(express.json())
app.set('query parser', 'extended')


//* Express Routing:

//* Read
app.get('/api/bug', (req, res) => {
    const filterBy = {
        txt: req.query.txt || '',
        minSeverity: +req.query.minSeverity,
        labels: Array.isArray(req.query.labels)
            ? req.query.labels
            : req.query.labels
                ? req.query.labels.split(',')
                : []
        ,
        sortBy: req.query.sortBy || '',
        sortDir: +req.query.sortDir || 1,
        pageIdx: +req.query.pageIdx || 0
    }
    console.log("filterBy: ", filterBy)

    bugService.query(filterBy)
        .then(bugs => res.send(bugs))
        .catch(err => {
            // loggerService.error('Cannot get bugs', err)
            res.status(400).send('Cannot load bugs')
        })
})

//* Get/Read by id
app.get('/api/bug/:bugId', (req, res) => {
    const { bugId } = req.params

    // שליפת הבאגים שצפו בהם עד עכשיו
    let visitedBugs = req.cookies.visitedBugs || '[]'
    visitedBugs = JSON.parse(visitedBugs)

    // אם הבאג הנוכחי לא קיים כבר ברשימה – נוסיף אותו
    if (!visitedBugs.includes(bugId)) {
        visitedBugs.push(bugId)
    }

    console.log('User visited the following bugs:', visitedBugs)

    // הגבלת צפייה ל־3 באגים שונים
    if (visitedBugs.length > 3) {
        return res.status(401).send('Wait for a bit')
    }

    // שמירת העדכון בקוקי ל־7 שניות
    res.cookie('visitedBugs', JSON.stringify(visitedBugs), {
        maxAge: 20 * 1000,
        httpOnly: true,
    })

    // שליפת הבאג והחזרה
    bugService.getById(bugId)
        .then(bug => res.send(bug))
        .catch(err => {
            res.status(400).send('Cannot get bug')
        })
})

//* Remove/Delete
app.delete('/api/bug/:bugId', (req, res) => {
    const { bugId } = req.params
    bugService.remove(bugId)
        .then(() => res.send(`Bug removed - ${bugId}`))
        .catch(err => {
            // loggerService.error('Cannot remove bug', err)
            res.status(400).send('Cannot remove bug')
        })
})

//* Create
app.post('/api/bug', (req, res) => {
    const bugToSave = {
        title: req.body.title,
        description: req.body.description,
        severity: +req.body.severity,
    }

    bugService.save(bugToSave)
        .then(savedBug => res.send(savedBug))
        .catch(err => {
            // loggerService.error('Cannot save bug', err)
            res.status(400).send('Cannot save bug')
        })
})

//* Edit
app.put('/api/bug/:bugId', (req, res) => {
    const bugToSave = {
        title: req.body.title,
        description: req.body.description,
        severity: +req.body.severity,
        _id: req.body._id,
    }

    bugService.save(bugToSave)
        .then(savedBug => res.send(savedBug))
        .catch(err => {
            // loggerService.error('Cannot save bug', err)
            res.status(400).send('Cannot save bug')
        })
})

// cookies
app.get('/api/bug/:bugId', (req, res) => {
    let visitedCount = req.cookies.visitedCount || 0
    visitedCount++
    console.log('visitedCount:', visitedCount)
    res.cookie('visitedCount', visitedCount, { maxAge: 5 * 1000 })
    console.log('visitedCount:', visitedCount)
    res.send('public')
})

//* Fallback route
app.get('/*all', (req, res) => {
    res.sendFile(path.resolve('public/index.html'))
})


const port = 3031

// app.listen(port, () =>
//     loggerService.info(`Server listening on port http://127.0.0.1:${port}/`)
// )
// app.listen(port)

app.listen(port, () => {
    console.log(`Server is ready at ${port} http://127.0.0.1:${port}/`)
})