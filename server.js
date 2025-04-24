import express from 'express'
import path from 'path'
import { bugService } from './services/bug.service.server.js'
import cookieParser from 'cookie-parser'
import { userService } from './services/user.service.js'
import { authService } from './services/auth.service.js'

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
            console.log("err: ", err)
            res.status(400).send('Cannot get bug')
        })
})

//* Create
app.post('/api/bug', (req, res) => {
    const loggedinUser = authService.validateToken(req.cookies.loginToken)
    if (!loggedinUser) return res.status(401).send(`Can't add bug`)

    const bugToSave = {
        title: req.body.title,
        description: req.body.description,
        severity: +req.body.severity,
    }

    bugService.save(bugToSave, loggedinUser)
        .then(savedBug => res.send(savedBug))
        .catch(err => {
            console.log("err: ", err)
            res.status(400).send('Cannot save bug')
        })
})

//* Edit
app.put('/api/bug/:bugId', (req, res) => {
    const loggedinUser = authService.validateToken(req.cookies.loginToken)
    if (!loggedinUser) return res.status(401).send(`Can't update bug`)
    console.log("req.body: ", req.body)
    const bugToSave = {
        title: req.body.title,
        description: req.body.description,
        severity: +req.body.severity,
        _id: req.body._id,
        creator: {...req.body.creator}

    }

    bugService.save(bugToSave, loggedinUser)
        .then(savedBug => res.send(savedBug))
        .catch(err => {
            console.log("err: ", err)
            res.status(400).send('Cannot save bug')
        })
})

//* Remove/Delete
app.delete('/api/bug/:bugId', (req, res) => {
    const loggedinUser = authService.validateToken(req.cookies.loginToken)
    if (!loggedinUser) return res.status(401).send(`Can't remove bug`)

    const { bugId } = req.params
    bugService.remove(bugId, loggedinUser)
        .then(() => res.send(`Bug removed - ${bugId}`))
        .catch(err => {
            console.log("err: ", err)
            res.status(400).send('Cannot remove bug')
        })
})

//* User API
app.get('/api/user', (req, res) => {
    userService.query()
        .then(users => res.send(users))
        .catch(err => {
            console.log("err: ", err)
            res.status(400).send('Cannot load users')
        })
})

app.get('/api/user/:userId', (req, res) => {
    const { userId } = req.params

    userService.getById(userId)
        .then(user => res.send(user))
        .catch(err => {
            console.log("err: ", err)
            res.status(400).send('Cannot load user')
        })
})

//* Auth API
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body
    authService.checkLogin({ username, password })
        .then(user => {
            const loginToken = authService.getLoginToken(user)
            res.cookie('loginToken', loginToken)
            res.send(user)
        })
        .catch(() => res.status(404).send('Invalid Credentials'))
})

app.post('/api/auth/signup', (req, res) => {
    const { username, password, fullname } = req.body
    userService.add({ username, password, fullname })
        .then(user => {
            if (user) {
                const loginToken = authService.getLoginToken(user)
                res.cookie('loginToken', loginToken)
                res.send(user)
            } else {
                res.status(400).send('Cannot signup')
            }
        })
        .catch(err => {
            console.log('err:', err)
            res.status(400).send('Username taken.')
        })
})

app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('loginToken')
    res.send('logged-out!')
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

app.get('/echo-cookies', (req, res) => {
    var cookieCount = 0
    var resStr = ''

    for (const cookie in req.cookies) {
        const cookieStr = `${cookie}: ${req.cookies[cookie]}`
        console.log(cookieStr)

        resStr += cookieStr + '\n'
        cookieCount++
    }
    resStr += `Total ${cookieCount} cookies`
    res.send(resStr)
})

//* Fallback route
app.get('/*all', (req, res) => {
    res.sendFile(path.resolve('public/index.html'))
})

const port = process.env.PORT || 3031
app.listen(port, () => {
    console.log(`Server is ready at ${port} http://127.0.0.1:${port}/`)
})