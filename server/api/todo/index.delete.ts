import { db } from '@/server/db';

export default defineEventHandler(() => {
  db.todos = db.todos.filter(item => item.checked === false)
  return db.todos
})