import { db } from '@/server/db';

export default defineEventHandler(() => {
  return { todos: db.todos }
})