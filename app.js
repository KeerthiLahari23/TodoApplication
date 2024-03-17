const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')

const app = express()
app.use(express.json())
let db = null

const dbPath = path.join(__dirname, 'todoApplication.db')

const InitializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server is starting at http://localhost:3000')
    })
  } catch (error) {
    console.log(`DB Error:${error.message}`)
    process.exit(1)
  }
}
InitializeDbAndServer()

const outputFormat = dbObject => {
  return {
    id: dbObject.id,
    todo: dbObject.todo,
    priority: dbObject.priority,
    status: priority.status,
  }
}

const hasPriorityAndSatusProperties = reqQuery => {
  return reqQuery.priority !== undefined && reqQuery.status !== undefined
}

const hasPriorityProperty = reqQuery => {
  return reqQuery.priority !== undefined
}

const hasStatusProperty = reqQuery => {
  return reqQuery.status !== undefined
}

app.get('/todos', async (request, response) => {
  const {search_query = '', priority, status} = request.query
  let q = ''
  switch (true) {
    case hasPriorityAndSatusProperties(request.query):
      q = `select * from todo where todo like "%${search_query}%"
        and status="${status}" and priority="${priority}";`
      break
    case hasPriorityProperty(request.query):
      q = `select * from todo where todo like "%${search_query}%"
        and priority="${priority}";`
      break
    case hasStatusProperty(request.query):
      q = `select * from todo where todo like "%${search_query}%"
        and status="${status}";`
      break
    default:
      q = `select * from todo where todo like "%${search_query}%"`
  }
  const data = await db.all(q)
  response.send(data)
})

app.get('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const q = `select * from todo where id=${todoId}`
  const res = await db.get(q)
  response.send(res)
})

app.post('/todos/', async (request, response) => {
  const {id, todo, priority, status} = request.body
  const q = `insert into todo(id,todo,priority,status) values(${id},"${todo}","${priority}","${status}")`
  await db.run(q)
  response.send('Todo Successfully Added')
})

app.put('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  let updatedQuery = ''
  const requestBody = request.body
  switch (true) {
    case requestBody.status !== undefined:
      updatedQuery = 'Status'
      break
    case requestBody.priority !== undefined:
      updatedQuery = 'Priority'
      break
    case requestBody.todo !== undefined:
      updatedQuery = 'Todo'
      break
  }
  const preQuery = `select * from todo where id=${todoId}`
  const preRes = await db.get(preQuery)
  const {
    todo = preRes.todo,
    priority = preRes.priority,
    status = preRes.status,
  } = request.body
  const q = `update todo set todo="${todo}",priority="${priority}",status="${status}"`
  await db.run(q)
  response.send(`${updatedQuery} Updated`)
})

app.delete('/todos/:todoId', async (request, response) => {
  const {todoId} = request.params
  const q = `delete from todo where id=${todoId}`
  await db.run(q)
  response.send('Todo Deleted')
})

module.exports = app
