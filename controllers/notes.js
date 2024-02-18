const notesRouter = require('express').Router()
const Note = require('../models/note')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

// GET all method
notesRouter.get('/', async (request, response) => {
  const notes = await Note.find({}).populate('user', { username: 1, name: 1 })
  response.json(notes)
})

// Auth method
const getTokenFrom = req => {
  const authorization = req.get('authorization')
  if(authorization && authorization.startsWith('Bearer ')) {
    return authorization.replace('Bearer ', '')
  }
  return null
}

// GET id method
notesRouter.get('/:id', async (request, response) => {
  try {
    const note = await Note.findById(request.params.id);

    if (!note) {
      return response.status(404).json({ error: 'Note not found' });
    }

    response.json(note);
  } catch (error) {
    console.error(error);
    response.status(400).json({ error: 'Internal Server Error' });
  }
});


// POST method
notesRouter.post('/', async (request, response) => {
  const body = request.body
  const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET)
  if(!decodedToken.id) {
    return response.status(401).json({ error: "Token Invalid" })
  }
  const user = await User.findById(decodedToken.id)

  const note = new Note({
    content: body.content,
    important: body.important || false,
    user: user.id
  })

  const savedNote = await note.save()
  user.notes =user.notes.concat(savedNote._id)
  await user.save()

  response.status(201).json(savedNote)
})

// DELETE method
notesRouter.delete('/:id', async (request, response) => {
  await Note.findByIdAndDelete(request.params.id)
  response.status(204).end()
})

// PUT method
notesRouter.put('/:id', (request, response, next) => {
  const body = request.body

  const note = {
    content: body.content,
    important: body.important,
  }

  Note.findByIdAndUpdate(request.params.id, note, { new: true })
    .then(updatedNote => {
      response.json(updatedNote)
    })
    .catch(error => next(error))
})

module.exports = notesRouter