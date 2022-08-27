function createTodoItem(id, name, done = false, {onDone, onDelete}) {
  let item = document.createElement('li');
  let buttonGroup = document.createElement('div');
  let doneButton = document.createElement('button');
  let deleteButton = document.createElement('button');

  item.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center', 'mb-2');
  if (done) {
    item.classList.add('list-group-item-success');
  }
  item.textContent = name;
  item.id = id;
  buttonGroup.classList.add('btn-group', 'btn-group-sm');
  doneButton.classList.add('btn', 'btn-success', 'mr-2');
  doneButton.textContent = 'Готово';
  deleteButton.classList.add('btn', 'btn-danger');
  deleteButton.textContent = 'Удалить';

  doneButton.addEventListener('click', () => {
    const done = onDone(id, !item.classList.value.includes('list-group-item-success')).done;
    item.classList.toggle('list-group-item-success', done);
  });

  deleteButton.addEventListener('click', () => {
    if (confirm('Вы уверены?')) {
      onDelete(item.id);
      item.remove();
    }
  });

  buttonGroup.append(doneButton);
  buttonGroup.append(deleteButton);
  item.append(buttonGroup);

  return item;
}

(() => {
  function createAppTitle(title) {
    let appTitle = document.createElement('h2');
    appTitle.innerHTML = title;
    return appTitle;
  }

  function createTodoItemForm() {
    let form = document.createElement('form');
    let input = document.createElement('input');
    let buttonWrapper = document.createElement('div');
    let button = document.createElement('button');

    form.classList.add('input-group', 'mb-3');
    input.classList.add('form-control');
    input.placeholder = 'Введите название нового дела';
    buttonWrapper.classList.add('input-group-append');
    button.classList.add('btn', 'btn-primary');
    button.textContent = 'Добавить дело';
    button.disabled = true;

    buttonWrapper.append(button);
    form.append(input);
    form.append(buttonWrapper);

    return {
      form,
      input,
      button,
    };
  }

  function createTodoList() {
    let list = document.createElement('ul');
    list.classList.add('list-group');
    return list;
  } 

  async function getTodoServerTask(owner) {
    const serverPath = 'http://localhost:3000/api/todos'
    const response = await fetch(`${serverPath}?owner=${owner}`, {method: 'GET',});
    return await response.json();;
  }

  async function setTodoServer(name, owner, done) {
    const response = await fetch("http://localhost:3000/api/todos/", {
      method: "POST",
      body: JSON.stringify({
          name,
          owner,
          done,
      }),
      headers: {
        'Content-Type':'application/json',
      },
    });
    return await response.json();
  }

  async function createTodoApp(container, title, owner) {
    let todoList = createTodoList();
    let todoAppTitle = createAppTitle(title);
    let todoForm = createTodoItemForm();
    const tasks = await getTodoServerTask(owner);
    const actionTask = {
      async onDone (taskId, done) {

        const response = await fetch(`http://localhost:3000/api/todos/${taskId}`,
          {
            method: 'PATCH',
            body: 
              JSON.stringify({done}),
            headers: {
              'Content-Type':'application/json',
            },
          },
        );
        return await response.json();
      },
      async onDelete (taskId) {
        const response = await fetch(`http://localhost:3000/api/todos/${taskId}`,
        { method: 'DELETE' });
        return await response.json();
      }
    };
    container.append(todoAppTitle, todoForm.form, todoList);

    if (tasks.length) {
      tasks.forEach((e) => {
        todoList.append(createTodoItem(e.id, e.name, e.done, actionTask));
      });
    }

    todoForm.form.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (!todoForm.input.value) {
        return;
      }
      const responseTodoItem = await setTodoServer(todoForm.input.value, owner, false);

      todoList.append(createTodoItem(responseTodoItem.id,
        responseTodoItem.name,
        responseTodoItem.done,
        actionTask)
        );

      todoForm.input.value = '';
      todoForm.button.disabled = true;
    });

    todoForm.input.addEventListener('input', (e) => {
      if (!e.target.value) {
        todoForm.button.disabled = true;
      } else {
        todoForm.button.disabled = false;
      }
    });
  }

  window.createTodoApp = createTodoApp;
})();
