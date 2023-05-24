<template>
  <div class="container">
    <div class="row justify-content-center">
      <div class="col-md-8 col-xxl-6">
        <h1 class="title">TODO LIST</h1>
        <div class="row g-2 mt-3">
          <div class="col-md-8 col-xxl-9">
            <input type="text" v-model="todoTemp" placeholder="Enter todo's thing here..." class="w-100 px-2">
          </div>
          <div class="col-md-4 col-xxl-3">
            <button @click="addNewTodo()" class="btn btn-sm btn-success w-100">Add</button>
          </div>
        </div>
        <div v-if="todos.length">
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
          <ul class="list-unstyled todos my-3 bg-light" v-if="filterTodos.length">
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
          <p v-else class="border my-2 rounded text-center bg-light lh-lg">
            There is nothing.
          </p>
          <div class="mt-3 d-flex justify-content-between align-items-center">
            <p class="text-start">🎉 Already finish {{ doneCount }} thing !</p>
            <button :class="{ 'disabled': doneCount === 0 }" class="btn btn-sm custom-btn-dark" @click.prevent="() => deleteAllDone()">Delete All Done</button>
          </div>
        </div>
        <div class="row g-2" v-else>
          <div>
            <p class="border py-5 my-2 rounded text-center bg-light lh-lg">
              There Is Nothing Need Todo<br>
              Please Add New Todo By Top Input.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const { todos, updateTodo, deleteTodo, deleteAllDone, addTodo } = useTodo();

const filterTodos = computed(() => {
  if (toggleTab.value === 'all') {
    return todos.value;
  } else if (toggleTab.value === 'undo') {
    return todos.value.filter(item => item.checked === false);
  } else {
    return todos.value.filter(item => item.checked === true);
  }
});

const toggleTab = ref("all");

const doneCount = computed(() => {
  const arr = todos.value.filter(item => item.checked === true);
  return arr.length;
});

const todoTemp = ref("");
const addNewTodo = () => {
  addTodo(todoTemp.value);
  todoTemp.value = "";
};
</script>

<style>
* {
  color: #666;
  font-family: "Comic Sans MS" !important;
}

.title {
  text-align: center;
  font-size: 36px;
  font-weight: bold;
  line-height: 2;
}

.todos {
  max-width: 700px;
  margin: 20px auto;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  border: 1px solid #666;
  border-radius: 4px;
  padding: 0 10px;
}

.todos-item {
  border-bottom: 1px solid #666;
  width: 100%;
  padding: 10px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.todos-item:last-of-type {
  border: none;
}

.todos-item>div {
  display: flex;
  justify-content: center;
  align-items: center;
}

input[type="checkbox"] {
  cursor: pointer;
  visibility: hidden;
  margin-right: 20px;
}

input[type="checkbox"]:after {
  content: " ";
  display: block;
  visibility: visible;
  color: #fff;
  font-size: 12px;
  width: 16px;
  height: 16px;
  text-align: center;
  line-height: 14px;
  border: 1px solid #000;
  border-radius: 5px;
}

input[type="checkbox"]:checked:after {
  content: "✔";
  background-color: #00aa00;
}

.custom-btn-dark {
  border: 1px solid #789;
  background-color: #789;
  color: #fff;
}

.custom-btn-delete {
  border: 1px solid #987;
  background-color: #987;
  color: #fff;
}

.custom-btn-tab {
  border: 1px solid #666;
  background-color: #ffa;
  color: #666;
}

.active {
  background-color: #00aa0050;
}

.text-decoration-line-through {
  opacity: 0.4;
  font-style: italic;
}

.hover-bg>* {
  cursor: pointer;
}

.hover-bg:hover {
  text-decoration: underline;
}

p {
  margin: 0;
}
</style>