const useTodo = () => {
  const { data: todos, refresh: refreshTodos } = useAsyncData('todos', async () => {
    const res = await $fetch('/api/todo');
    return res.todos;
  });

  const deleteAllDone = () => {
    if (confirm('是否確定要清除所有已完成項目？注意！此動作無法復原！')) {
      useFetch('/api/todo', {
        method: 'delete'
      }).then(() => refreshTodos());
    }
  };

  const addTodo = (item: string) => {
    if (!item) return;
    useFetch('/api/todo', {
      method: "POST",
      body: { content: item }
    }).then(() => {
      refreshTodos();
    });
  };

  const deleteTodo = (id: string) => {
    useFetch(`/api/todo/${id}`, {
      method: 'delete'
    }).then(() => refreshTodos());
  };

  const updateTodo = (id: string) => {
    useFetch(`/api/todo/${id}`, {
      method: 'put',
    }).then(() => refreshTodos());
  };

  return { todos, addTodo, updateTodo, deleteAllDone, deleteTodo }
}

export default useTodo