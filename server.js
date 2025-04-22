import express from 'express'
import { bugService } from './services/bug.service.server.js'
import cookieParser from 'cookie-parser'

const app = express()

//* Express Config:
app.use(express.static('public'))
app.use(cookieParser())

// app.get('/', (req, res) => res.send('Hello there'))


//* Express Routing:
//* Read
app.get('/api/bug', (req, res) => {
    console.log(req.query)
    const filterBy = {
        txt: req.query.txt || '',
        minSeverity: +req.query.minSeverity,
    }
    bugService.query(filterBy)
        .then(bugs => res.send(bugs))
        .catch(err => {
            // loggerService.error('Cannot get bugs', err)
            res.status(400).send('Cannot load bugs')
        })
})

//* Create/Edit
app.get('/api/bug/save', (req, res) => {

    const bugToSave = {
        title: req.query.title,
        description: req.query.description,
        severity: +req.query.severity,
        _id: req.query._id,
    }
    
    bugService.save(bugToSave)
        .then(savedBug => res.send(savedBug))
        .catch(err => {
            // loggerService.error('Cannot save bug', err)
            res.status(400).send('Cannot save bug')
        })
})

//* Get/Read by id
app.get('/api/bug/:bugId', (req, res) => {
    const { bugId } = req.params
    bugService.getById(bugId)
        .then(bug => res.send(bug))
        .catch(err => {
            // loggerService.error('Cannot get bug', err)
            res.status(400).send('Cannot get bug')
        })
})

//* Remove/Delete
app.get('/api/bug/:bugId/remove', (req, res) => {
    const { bugId } = req.params
    bugService.remove(bugId)
        .then(() => res.send(`Bug removed - ${bugId}`))
        .catch(err => {
            // loggerService.error('Cannot remove bug', err)
            res.status(400).send('Cannot remove bug')
        })
})


const port = 3031

// app.listen(port, () =>
//     loggerService.info(`Server listening on port http://127.0.0.1:${port}/`)
// )
 app.listen(port)