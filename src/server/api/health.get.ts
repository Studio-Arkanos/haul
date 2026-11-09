import { defineEventHandler } from 'h3'

export default defineEventHandler(() => ({
  ok: true,
  service: 'haul-api',
  time: new Date().toISOString(),
}))
