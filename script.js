const modal = document.querySelector(".confirm-modal");
const columnsContainer = document.querySelector(".columns");
const columns = columnsContainer.querySelectorAll(".column");

let currentTask = null;

const handleDragover = (event) => {
  event.preventDefault();
  const draggedTask = document.querySelector(".dragging");
  const target = event.target.closest(".task, .tasks");

  if (!target || target === draggedTask) return;

  if (target.classList.contains("tasks")) {
    const lastTask = target.lastElementChild;
    if (!lastTask) {
      target.appendChild(draggedTask);
    } else {
      const { bottom } = lastTask.getBoundingClientRect();
      if (event.clientY > bottom) target.appendChild(draggedTask);
    }
  } else {
    const { top, height } = target.getBoundingClientRect();
    const midpoint = top + height / 2;

    if (event.clientY < midpoint) {
      target.before(draggedTask);
    } else {
      target.after(draggedTask);
    }
  }
};

const handleDrop = (event) => {
  event.preventDefault();
};

const handleDragend = (event) => {
  event.target.classList.remove("dragging");
};

const handleDragstart = (event) => {
  event.dataTransfer.setData("text/plain", "");
  requestAnimationFrame(() => event.target.classList.add("dragging"));
};

const handleDelete = (event) => {
  currentTask = event.target.closest(".task");
  modal.querySelector(".preview").innerText = currentTask.innerText.substring(0, 100);
  modal.showModal();
};

const handleEdit = (event) => {
  const task = event.target.closest(".task");
  const input = createTaskInput(task.innerText.trim());
  task.replaceWith(input);
  input.focus();

  const selection = window.getSelection();
  selection.selectAllChildren(input);
  selection.collapseToEnd();
};

const handleBlur = (event) => {
  const input = event.target;
  const content = input.innerText.trim() || "Untitled";
  const task = createTask(content.replace(/\n/g, "<br>"));
  input.replaceWith(task);
};

const handleAdd = (event) => {
  const tasksEl = event.target.closest(".column").querySelector(".tasks");
  const input = createTaskInput();
  tasksEl.appendChild(input);
  input.focus();
};

const updateTaskCount = (column) => {
  const tasks = column.querySelector(".tasks").children;
  column.querySelector(".column-title h3").dataset.tasks = tasks.length;
};

const observeTaskChanges = () => {
  for (const column of columns) {
    const observer = new MutationObserver(() => updateTaskCount(column));
    observer.observe(column.querySelector(".tasks"), { childList: true });
  }
};

const createTask = (content, description = "") => {
  const task = document.createElement("div");
  task.className = "task";
  task.draggable = true;
  task.dataset.description = description;
  task.dataset.taskId = crypto.randomUUID();

  task.innerHTML = `
    <div>${content}</div>
    <menu>
      <button data-edit title="Edit Task">Edit</button>
      <button data-delete title="Delete Task">X</button>
      <button data-more title="View Description">...</button>
    </menu>
  `;

  task.addEventListener("dragstart", handleDragstart);
  task.addEventListener("dragend", handleDragend);

  return task;
};

const createTaskInput = (text = "") => {
  const input = document.createElement("div");
  input.className = "task-input";
  input.dataset.placeholder = "Task name";
  input.contentEditable = true;
  input.innerText = text;
  input.addEventListener("blur", handleBlur);
  return input;
};

// Drag/drop events
const tasksElements = columnsContainer.querySelectorAll(".tasks");
for (const tasksEl of tasksElements) {
  tasksEl.addEventListener("dragover", handleDragover);
  tasksEl.addEventListener("drop", handleDrop);
}

// Handle add/edit/delete/more
columnsContainer.addEventListener("click", (event) => {
  if (event.target.closest("button[data-add]")) {
    handleAdd(event);
  } else if (event.target.closest("button[data-edit]")) {
    handleEdit(event);
  } else if (event.target.closest("button[data-delete]")) {
    handleDelete(event);


modal.addEventListener("submit", () => currentTask && currentTask.remove());
modal.querySelector("#cancel").addEventListener("click", () => modal.close());
modal.addEventListener("close", () => (currentTask = null));
