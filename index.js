const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

const Note = require('./models/note')

const requestLogger = (req, res, next) => {
    console.log('Method:', req.method);
    console.log('Path:', req.path);
    console.log('Body:', req.body);
    console.log('---');
    next()
}

const errorHandler = (error, req, res, next) => {
    console.log(error.message);

    if(error.message === 'CastError') {
        return res.status(400).send(
            {error: 'malformatted id'}
        )
    } else if (error.name === 'ValidationError') {
        return res.status(400).json({ error: error.message})
    }
    next(error)
}

const unknownEndpoint = (req, res) => {
    res.status(404).send({error: "Unknown endpoint"})
}

app.use(cors())
app.use(express.json())
app.use(requestLogger)
app.use(express.static('dist'))

app.get('/info', (req,res) => {
    res.send('<h1> Hello web, I am the world! </h1>')
})

app.get('/api/notes', (req, res) => {
    Note.find({}).then(notes => {
        res.json(notes)
    })
})

app.get('/api/notes/:id', (request, response, next) => {
    Note.findById(request.params.id)
      .then(note => {
        if (note) {
          response.json(note)
        } else {
          response.status(404).end() 
        }
      })
      .catch(error => next(error))
})


app.post('/api/notes', (req, res, next) => {
    const body = req.body

    if(body.content === undefined) {
        return res.status(400).json({error: 'Content missing'})
    }

    const note = new Note ({
        content: body.content,
        important: Boolean(body.important) || false,
    })
    
    note.save().then(savedNote => {
        res.json(savedNote)
    }).catch(err => next(err))
})

app.put('/api/notes/:id', (req, res, next) => {
    const { content, important } = req.body

    const note ={
        content: body.content,
        important: body.important,
    }

    Note.findByIdAndUpdate(req.params.id,
        { content, important },
        { new: true, runValidators: true, context: 'query'}
        ).then(updatedNote => {
            res.json(updatedNote)
        }).catch(error => next(error))
})

app.delete('/api/notes/:id', (req, res, next) => {
    Note.findByIdAndDelete(req.params.id).then(result => {
        res.status(204).end()
    }).catch(error => next(error))
})

app.use(unknownEndpoint)
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})