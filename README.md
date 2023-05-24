# Nuxt3-project5 Todo List

原始碼：https://github.com/WangShuan/nuxt3-05-todolist

## 建立與啟動 Nuxt 專案

開啟終端機，`cd` 到桌面或任何希望創建該專案的位置
執行命令： 
```shell
npx nuxi init 05-todo-list
```

完成後，根據提示
先 `cd` 到專案目錄 `05-todo-list` 中
執行命令：
```shell
npm install
```
安裝所有依賴項目
此時會發現專案目錄中**生成了 `node_modules` 資料夾**

確認您的專案已成功安裝好所有依賴後
即可執行命令：
```shell
npm run dev
```
啟動 Nuxt 應用程序。

## 專案說明

本專案使用 Nuxt3 的 server 目錄建立 API
主要有以下幾個 API：
1. GET: `/api/todo` - 獲取所有 todo 項目
2. POST: `/api/todo` - 新增一個 todo 項目
3. DELETE: `/api/todo` - 刪除已完成的 todo 項目
4. PUT: `/api/todo/:id` - 切換特定 id 的 todo 項目的完成狀態
5. DELETE: `/api/todo/:id` - 刪除特定 id 的 todo 項目

## Server 建立方式

在 Nuxt3 中透過結合 [Nitro Server](https://nitro.unjs.io/) 可以自行創建 Web Servers 以建立 API

其建立方式只需要在項目根目錄中新增 `Servers` 資料夾
並於 `Servers` 資料夾中新增 `api` 資料夾
最後於 `api` 資料夾中即可開始規劃自己的 API 路徑

比如本專案中 `/api/todo` 就表示要先在 `api` 資料夾底下新增一個 `todo` 資料夾，
接著於 `todo` 資料夾中建立對應的 `method` 檔案撰寫 HTTP Request

舉例如下：
```typescript
// 在 server 資料夾中新增 db.ts 存放一個 todos 陣列當作基底資料
import { db } from '@/server/db';
// 匯出一個 defineEventHandler 函數
export default defineEventHandler(() => {
  // return db.todos 給前端接收 todos 的資料
  return { todos: db.todos }
})
```
由上述舉例可知，在每個檔案預設需要匯出 defineEventHandler() 函數，
並在函數中執行一個新的函數以處理邏輯最終 return 給前端結果。

另外在 `/servers/api` 資料夾中，主要可以通過副檔名的方式指定其請求的 `method`
比如 GET 請求的副檔名就會是 `.get.ts`； POST 請求的副檔名則為 `.post.ts` 依此類推
而像 `/api/todo/:id` 的 `api` 檔案就如 `pages` 的路由建立方式一樣，
建立的檔案名稱為 `[id].put.ts` => 將 `id` 這個動態路由使用 `[]` 包起來即可

### GET 獲取所有 todo 項目

在 Servers 中可通過以下程式碼建立 API 傳遞資料給前端：
```typescript
// 檔案路徑： /server/api/todo/index.get.ts
import { db } from '@/server/db';
export default defineEventHandler(() => {
  return { todos: db.todos }
})
```
在前端可通過以下程式碼獲取 todos 資料：
```typescript
const { data: todos, refresh: refreshTodos } = useAsyncData('todo', async () => {
  const res = await $fetch('/api/todo')
  return res.todos;
});
```

### POST 新增一個 todo 項目

在 Servers 中可通過以下程式碼建立 API 傳遞資料給前端：
```typescript
// 檔案路徑： /server/api/todo/index.post.ts
import { db } from '@/server/db';
import { v4 as uuidv4 } from 'uuid'; // 安裝並引入 uuid 已生成隨機亂數的 id

export default defineEventHandler(async (e) => {
  const body = await readBody(e); // 獲取 post body 內容
  if (!body.content) { // 如果 post body 不存在則拋出錯誤
    throw createError({
      statusCode: 400,
      statusMessage: "錯誤！無法建立空項目。"
    })
  };
  const newTodo = { // 建立新 todo
    content: body.content, // 傳入 post body 內容
    checked: false, // 設置初始 checked
    id: uuidv4() // 設定 id 為 uuid
  };
  db.todos.push(newTodo); // 往 todos 資料 push 新增 todo
  return newTodo;
})
```
在前端可通過以下程式碼新增 todo：
```typescript
const addTodo = (item: string) => { // item 從 app.vue 檔案中，通過 `() => addTodo(todoTemp)` 傳入
  if (!item) return;
  useFetch('/api/todo', {
    method: "POST",
    body: { content: item } // 傳入 todo 事項內容
  }).then(() => {
    item = ""; // 清空 todo 事項內容
    refreshTodos(); // 重新獲取 todos 資料
  });
};
```

### DELETE 刪除已完成的 todo 項目

在 Servers 中可通過以下程式碼建立 API 傳遞資料給前端：
```typescript
// 檔案路徑： /server/api/todo/index.delete.ts
import { db } from '@/server/db';
export default defineEventHandler(() => {
  db.todos = db.todos.filter(item => item.checked === false)
  return db.todos
})
```
在前端可通過以下程式碼刪除已完成的 todo 項目：
```typescript
const deleteAllDone = () => {
  if (confirm('是否確定要清除所有已完成項目？注意！此動作無法復原！')) {
    useFetch('/api/todo', {
      method: 'delete'
    }).then(() => refreshTodos()); // 重新獲取 todos 資料
  }
};
```

### PUT 切換特定 id 的 todo 項目的完成狀態

在 Servers 中可通過以下程式碼建立 API 傳遞資料給前端：
```typescript=
// 檔案路徑： /server/api/todo/[id].put.ts
import { db } from '@/server/db';
export default defineEventHandler((event) => {
  const id = event.context.params?.id; // 獲取 id
  const i = db.todos.findIndex(item => item.id == id); // 獲取索引值
  if (!db.todos[i]) { // 如果 i 不存在則拋出錯誤
    throw createError({
      statusCode: 404,
      statusMessage: "錯誤！項目不存在。"
    })
  };
  const newTodo = { // 更新 todo 的完成狀態
    ...db.todos[i],
    checked: !db.todos[i].checked
  }
  db.todos[i] = newTodo // 將 todos 中的項目更新
  return newTodo
})
```
在前端可通過以下程式碼獲取 todos 資料：
```typescript
const updateTodo = (id) => {
  useFetch(`/api/todo/${id}`, {
    method: 'put',
  }).then(() => refreshTodos()); // 重新獲取 todos 資料
};
```

### DELETE 刪除特定 id 的 todo 項目

在 Servers 中可通過以下程式碼建立 API 傳遞資料給前端：
```typescript
// 檔案路徑： /server/api/todo/[id].delete.ts
import { db } from '@/server/db';
export default defineEventHandler((event) => {
  const id = event.context.params?.id; // 獲取 id
  const i = db.todos.findIndex(item => item.id == id); // 獲取索引值
  if (!db.todos[i]) { // 如果 i 不存在則拋出錯誤
    throw createError({
      statusCode: 404,
      statusMessage: "錯誤！項目不存在。"
    })
  };
  db.todos.splice(i, 1) // 從 todos 中刪除索引值開始的一個項目
  return db.todos
})

```
在前端可通過以下程式碼刪除特定 id 的 todo 項目：
```typescript
const deleteTodo = (id) => {
  useFetch(`/api/todo/${id}`, {
    method: 'delete'
  }).then(() => refreshTodos()); // 重新獲取 todos 資料
};
```


## 將前端 API 請求封裝為 composables

在項目根目錄中建立 composables 資料夾
在 composables 資料夾底下新增 useTodo.ts：
```typescript
const useTodo = () => {
  
  // 獲取 todos 資料
  const { data: todos, refresh: refreshTodos } = useAsyncData('todos', async () => {
    const res = await $fetch('/api/todo');
    return res.todos;
  });

  // 刪除所有已完成項目
  const deleteAllDone = () => {
    if (confirm('是否確定要清除所有已完成項目？注意！此動作無法復原！')) {
      useFetch('/api/todo', {
        method: 'delete'
      }).then(() => refreshTodos());
    }
  };

  // 新增項目
  const addTodo = (item: string) => {
    if (!item) return;
    useFetch('/api/todo', {
      method: "POST",
      body: { content: item }
    }).then(() => {
      item = "";
      refreshTodos();
    });
  };

  // 刪除項目
  const deleteTodo = (id: string) => {
    useFetch(`/api/todo/${id}`, {
      method: 'delete'
    }).then(() => refreshTodos());
  };

  // 更新項目
  const updateTodo = (id: string) => {
    useFetch(`/api/todo/${id}`, {
      method: 'put',
    }).then(() => refreshTodos());
  };

  return { todos, addTodo, updateTodo, deleteAllDone, deleteTodo }
}

export default useTodo
```

## 於前端使用 composables

這邊簡單準備一個 template：
https://codepen.io/WangShuan/pen/gOrzLVa?editors=1100
>注意：此 template 有使用到 bootstrap 樣式
>請記得於 nuxt.config.ts 中添加 [bootstrap CSS](https://cdn.jsdelivr.net/npm/bootstrap@5.0.0/dist/css/bootstrap.min.css) 的 link

首先將 codepen 內容轉貼到 app.vue 檔案中

在輸入框的地方設定 v-model 為 todoTemp
並於新增項目的按鈕綁定 addTodo 方法：
```htmlembedded
<div class="row g-2 mt-3">
  <div class="col-md-8 col-xxl-9">
    <input type="text" v-model="todoTemp" placeholder="Enter todo's thing here..." class="w-100">
  </div>
  <div class="col-md-4 col-xxl-3">
    <button @click="addNewTodo()" class="btn btn-sm btn-success w-100">Add</button>
  </div>
</div>
```

設置 tab 欄切換：
```htmlembedded
<ul class="list-unstyled my-3">
  <li class="row g-2">
    <div class="col-4">
      <button class="w-100 btn btn-sm custom-btn-tab" :class="{ 'active': toggleTab === 'all' }" @click="toggleTab = 'all'">All</button>
    </div>
    <div class="col-4">
      <button class="w-100 btn btn-sm custom-btn-tab" :class="{ 'active': toggleTab === 'undo' }" @click="toggleTab = 'undo'">Undo</button>
    </div>
    <div class="col-4">
      <button class="w-100 btn btn-sm custom-btn-tab" :class="{ 'active': toggleTab === 'done' }" @click="toggleTab = 'done'">Done</button>
    </div>
  </li>
</ul>
```

於列表 ul 中撰寫 v-for 顯示 todos 資料並綁定刪除與更新事件：
```htmlembedded
<ul class="list-unstyled todos my-3" v-if="filterTodos.length">
  <li v-for="item in filterTodos" :key="item.id" class="todos-item">
    <div class="col-9 col-xxl-10 hover-bg">
      <input type="checkbox" v-model="item.checked" @click="() => updateTodo(item.id)" :id="item.id">
      <label class="w-100" :for="item.id" :class="{ 'text-decoration-line-through': item.checked }">
        {{ item.content }}</label>
    </div>
    <div class="col-3 col-xxl-2">
      <button @click="() => deleteTodo(item.id)" class="btn custom-btn-delete btn-sm w-100">Delete</button>
    </div>
  </li>
</ul>
```

計算並顯示完成數量、綁定刪除所有已完成項目事件：
```htmlembedded
<div class="mt-3 d-flex justify-content-between align-items-center">
  <p class="text-start">🎉 Already finish {{ doneCount }} thing !</p>
  <button :class="{ 'disabled': doneCount === 0 }" class="btn btn-sm custom-btn-dark" @click.prevent="() => deleteAllDone()">Delete All Done</button>
</div>
```

撰寫上方用到的所有 JS：
```htmlembedded
<script setup>
// 引入 composables 
const { todos, updateTodo, deleteTodo, deleteAllDone, addTodo } = useTodo();

// 紀錄當前的 tab
const toggleTab = ref("all");

// 通過 computed 搭配 filter 方法呈現不同 tab 的 todo 項目
const filterTodos = computed(() => {
  if (toggleTab.value === 'all') {
    return todos.value;
  } else if (toggleTab.value === 'undo') {
    return todos.value.filter(item => item.checked === false);
  } else {
    return todos.value.filter(item => item.checked === true);
  }
});

// 計算已完成的數量
const doneCount = computed(() => {
  const arr = todos.value.filter(item => item.checked === true);
  return arr.length;
});

// 紀錄輸入框內容
const todoTemp = ref("");
// 新增項目並將輸入框內容清空
const addNewTodo = async () => {
  await addTodo(todoTemp.value);
  todoTemp.value = "";
};
</script>
```