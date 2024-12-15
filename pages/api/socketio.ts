import { Server as NetServer } from 'http'
import { NextApiRequest } from 'next'
import { Server as ServerIO } from 'socket.io'
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.KV_REST_API_URL || '',
  token: process.env.KV_REST_API_TOKEN || '',
})

export const config = {
  api: {
    bodyParser: false,
  },
}

const ioHandler = (req: NextApiRequest, res: any) => {
  if (!res.socket.server.io) {
    console.log('Initializing Socket.IO server...');
    const httpServer: NetServer = res.socket.server as any
    const io = new ServerIO(httpServer, {
      path: '/api/socketio',
      addTrailingSlash: false,
      transports: ['polling', 'websocket'],
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    })

    io.on('connection', (socket) => {
      console.log('New client connected:', socket.id)

      socket.on('error', (error) => {
        console.error('Socket error:', error);
      });

      socket.on('join', (conversationId) => {
        console.log(`Client ${socket.id} joined conversation: ${conversationId}`)
        socket.join(conversationId)
      })

      socket.on('leave', (conversationId) => {
        console.log(`Client ${socket.id} left conversation: ${conversationId}`)
        socket.leave(conversationId)
      })

      socket.on('message', async (message) => {
        console.log('Received message:', message)
        
        try {
          // Save the message to Redis
          let messages = await redis.get(`messages:${message.conversationId}`) || []
          messages = Array.isArray(messages) ? messages : []
          messages.push(message)
          await redis.set(`messages:${message.conversationId}`, messages)

          // Broadcast the message to all clients in the conversation
          io.to(message.conversationId).emit('message', message)

          // Update the conversation's last message and unread count
          const conversations = await redis.get('conversations') || []
          const updatedConversations = conversations.map((conv: any) => {
            if (conv.id === message.conversationId) {
              return { ...conv, lastMessage: message.content, unread: (conv.unread || 0) + 1 }
            }
            return conv
          })
          await redis.set('conversations', updatedConversations)

          console.log('Message saved and broadcasted successfully')
        } catch (error) {
          console.error('Error handling message:', error)
        }
      })

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id)
      })
    })

    res.socket.server.io = io
  } else {
    console.log('Socket.IO server already running');
  }
  res.end()
}

export default ioHandler

