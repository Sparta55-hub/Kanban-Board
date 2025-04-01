const modal = document.querySelector(".confirm-modal");
const columnsContainer = document.querySelector(".columns");
const columns = columnsContainer.querySelectorAll(".column");

// Task Description Modal Elements
const popupModal = document.getElementById("popupModal");
const closeButton = document.getElementById("closeButton");
const saveButton = document.getElementById("saveButton");
const descriptionText = document.getElementById("descriptionText");

let currentTask = null;

//* Drag & Drop Functions

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
      event.clientY > bottom && target.appendChild(draggedTask);
    }
  } else {
    const { top, height } = target.getBoundingClientRect();
    const distance = top + height / 2;

    if (event.clientY < distance) {
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
  event.dataTransfer.effectsAllowed = "move";
  event.dataTransfer.setData("text/plain", "");
  requestAnimationFrame(() => event.target.classList.add("dragging"));
};

//* Task Management Functions

const handleDelete = (event) => {
  currentTask = event.target.closest(".task");
  modal.querySelector(".preview").innerText = currentTask.innerText.substring(0, 100);
  modal.showModal();
};

const handleEdit = (event) => {
  const task = event.target.closest(".task");
  const input = createTaskInput(task.querySelector("strong").innerText);
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
  const tasksEl = event.target.closest(".column").lastElementChild;
  const input = createTaskInput();
  tasksEl.appendChild(input);
  input.focus();
};

const updateTaskCount = (column) => {
  const tasks = column.querySelector(".tasks").children;
  const taskCount = tasks.length;
  column.querySelector(".column-title h3").dataset.tasks = taskCount;
};

const observeTaskChanges = () => {
  for (const column of columns) {
    const observer = new MutationObserver(() => updateTaskCount(column));
    observer.observe(column.querySelector(".tasks"), { childList: true });
  }
};

observeTaskChanges();

const createTask = (content, description = "") => {
  const task = document.createElement("div");
  task.className = "task";
  task.draggable = true;
  task.dataset.description = description;
  task.innerHTML = `
    <div>
      <strong>${content}</strong><br>
      <small>${description || "No description"}</small>
    </div>
    <menu>
      <button data-edit title="Edit Task">Edit</button>
      <button data-delete title="Delete Task">X</button>
    </menu>`;
  
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

//* Task Description Functions

const handleTaskClick = (event) => {
  const task = event.target.closest(".task");
  if (!task) return;

  currentTask = task;
  descriptionText.value = task.dataset.description || "";
  popupModal.style.display = "flex";
};

const handleSaveDescription = () => {
  if (!currentTask) return;

  const description = descriptionText.value.trim();
  if (description) {
    currentTask.dataset.description = description;
    currentTask.querySelector("div").innerHTML = `
      <strong>${currentTask.querySelector("strong").innerText}</strong><br>
      <small>${description}</small>
    `;
  }
  popupModal.style.display = "none";
  currentTask = null;
};

//* Event Listeners

const tasksElements = columnsContainer.querySelectorAll(".tasks");
for (const tasksEl of tasksElements) {
  tasksEl.addEventListener("dragover", handleDragover);
  tasksEl.addEventListener("drop", handleDrop);
}

columnsContainer.addEventListener("click", (event) => {
  if (event.target.closest(".task")) {
    handleTaskClick(event);
  } else if (event.target.closest("button[data-add]")) {
    handleAdd(event);
  } else if (event.target.closest("button[data-edit]")) {
    handleEdit(event);
  } else if (event.target.closest("button[data-delete]")) {
    handleDelete(event);
  }
});

modal.addEventListener("submit", () => currentTask && currentTask.remove());
modal.querySelector("#cancel").addEventListener("click", () => modal.close());
modal.addEventListener("close", () => (currentTask = null));

closeButton.addEventListener("click", () => (popupModal.style.display = "none"));
window.addEventListener("click", (event) => {
  if (event.target === popupModal) {
    popupModal.style.display = "none";
  }
});
saveButton.addEventListener("click", handleSaveDescription);
