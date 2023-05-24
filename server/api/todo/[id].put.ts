import { db } from '@/server/db';

export default defineEventHandler((event) => {
  const id = event.context.params?.id;
  let i = db.todos.findIndex(item => item.id == id);
  if (!db.todos[i]) {
    throw createError({
      statusCode: 404,
      statusMessage: "錯誤！項目不存在。"
    })
  };
  const newTodo = {
    ...db.todos[i],
    checked: !db.todos[i].checked
  }
  db.todos[i] = newTodo
  return newTodo
})