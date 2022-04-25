import { createClient } from 'redis';

export const RedisClientConnect = () => {
  const RedisClient = createClient()

  RedisClient.on('error', (err) => {
    console.log(`Redis error: ${err}`)
    return err
  })

  RedisClient.on('connect', () => {
    console.log(`Connected to Redis`)
  })
  RedisClient.connect()

  return RedisClient
}
