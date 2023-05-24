import { db } from '@/server/db';
import { v4 as uuidv4 } from 'uuid';

export default defineEventHandler(async (e) => {
  const body = await readBody(e);
  if (!body.content) {
    throw createError({
      statusCode: 400,
      statusMessage: "錯誤！無法建立空項目。"
    })
  };
  const newTodo = {
    content: body.content,
    checked: false,
    id: uuidv4()
  };
  db.todos.push(newTodo);
  return newTodo;
})