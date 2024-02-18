const bcrypt = require('bcrypt')
const User = require('../models/user')

describe('when there is initially one user in db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekre', 10)
    const user = new User({ username: 'root', passwordHash })

    await user.save()
  }, 50000)

  test('creation succeeds with a fresh username', async () => {
    const userAtStart = await helper.usersInDb()

    const newUser = {
      username: 'mliikkai',
      name: 'Matti Luukkainen',
      password: 'salainen'
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const userAtEnd = await helper.usersInDb()
    expect(userAtEnd).toHaveLength(userAtStart.length + 1)

    const usernames = userAtEnd.map(n => u.username)
    expect(usernames).toContain(newUser.username)
  }, 50000)


  test('creation fails with proper statuscode and mesage if username already taken', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'root',
      name: 'Superuser',
      password: 'salainen'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('expected `username` to be unique')

    const userAtEnd =await helper.usersInDb()
    expect(userAtEnd).toEqual(usersAtStart)
  }, 50000)

})
