import { db } from '@/server/db';

export default defineEventHandler((event) => {
  const id = event.context.params?.id;
  const i = db.todos.findIndex(item => item.id == id);
  if (!db.todos[i]) {
    throw createError({
      statusCode: 404,
      statusMessage: "錯誤！項目不存在。"
    })
  };
  db.todos.splice(i, 1)
  return db.todos
})