import { createStore, applyMiddleware } from 'redux'
import users from './users'
import thunkMiddleware from 'redux-thunk'
import { createLogger } from 'redux-logger'

const store  = createStore(
  users,
  applyMiddleware(thunkMiddleware, createLogger())
)

export default store
