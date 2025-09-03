import express from 'express'
import path from 'path'

const app = express()
const port = process.env.PORT || 3000

// health check
app.get('/health', (_req, res) => res.json({ status: 'ok' }))

// Serve the built client (note the path from dist/ to client-dist/)
const clientDist = path.resolve(__dirname, '../client-dist')
app.use(express.static(clientDist))

// SPA fallback: send index.html for any unknown route
app.get('*', (_req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'))
})

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`)
})
