/**
 * Routes HTTP Convex. Convex Auth branche ici ses endpoints OAuth
 * (callback Google, etc.).
 */
import { httpRouter } from 'convex/server'
import { auth } from './auth'

const http = httpRouter()

auth.addHttpRoutes(http)

export default http
