const confirmationDialog = document.querySelector(".confirm-modal");
const boardContainer = document.querySelector(".columns");
const boardColumns = boardContainer.querySelectorAll(".column");

let selectedTask = null;

const onDragOver = (event) => {
  event.preventDefault();

  const activeTask = document.querySelector(".dragging");
  const dropTarget = event.target.closest(".task, .tasks");

  if (!dropTarget || dropTarget === activeTask) return;

  if (dropTarget.classList.contains("tasks")) {
    const lastTask = dropTarget.lastElementChild;
    if (!lastTask) {
      dropTarget.appendChild(activeTask);
    } else {
      const { bottom } = lastTask.getBoundingClientRect();
      event.clientY > bottom && dropTarget.appendChild(activeTask);
    }
  } else {
    const { top, height } = dropTarget.getBoundingClientRect();
    const midpoint = top + height / 2;

    if (event.clientY < midpoint) {
      dropTarget.before(activeTask);
    } else {
      dropTarget.after(activeTask);
    }
  }
};

const onDrop = (event) => {
  event.preventDefault();
};

const onDragEnd = (event) => {
  event.target.classList.remove("dragging");
};

const onDragStart = (event) => {
  event.dataTransfer.effectsAllowed = "move";
  event.dataTransfer.setData("text/plain", "");
  requestAnimationFrame(() => event.target.classList.add("dragging"));
};

const onDelete = (event) => {
  selectedTask = event.target.closest(".task");
  confirmationDialog.querySelector(".preview").innerText = selectedTask.innerText.substring(0, 100);
  confirmationDialog.showModal();
};

const onEdit = (event) => {
  const taskElement = event.target.closest(".task");
  const inputElement = createTaskInput(taskElement.innerText);
  taskElement.replaceWith(inputElement);
  inputElement.focus();

  const textSelection = window.getSelection();
  textSelection.selectAllChildren(inputElement);
  textSelection.collapseToEnd();
};

const onBlur = (event) => {
  const inputElement = event.target;
  const taskContent = inputElement.innerText.trim() || "Untitled";
  const newTask = createTask(taskContent.replace(/\n/g, "<br>"));
  inputElement.replaceWith(newTask);
};

const onAdd = (event) => {
  const taskListElement = event.target.closest(".column").lastElementChild;
  const inputElement = createTaskInput();
  taskListElement.appendChild(inputElement);
  inputElement.focus();
};

const refreshTaskCount = (columnElement) => {
  const taskElements = columnElement.querySelector(".tasks").children;
  const taskTotal = taskElements.length;
  columnElement.querySelector(".column-title h3").dataset.tasks = taskTotal;
};

const monitorTaskChanges = () => {
  for (const columnElement of boardColumns) {
    const observer = new MutationObserver(() => refreshTaskCount(columnElement));
    observer.observe(columnElement.querySelector(".tasks"), { childList: true });
  }
};

monitorTaskChanges();

const createTask = (content) => {
  const taskElement = document.createElement("div");
  taskElement.className = "task";
  taskElement.draggable = true;
  taskElement.innerHTML = `
    <div>${content}</div>
    <menu>
      <button data-edit title="Edit Task">Edit</button>
      <button data-delete title="Delete Task">X</button>
    </menu>`;
  taskElement.addEventListener("dragstart", onDragStart);
  taskElement.addEventListener("dragend", onDragEnd);
  return taskElement;
};

const createTaskInput = (text = "") => {
  const inputElement = document.createElement("div");
  inputElement.className = "task-input";
  inputElement.dataset.placeholder = "Task name";
  inputElement.contentEditable = true;
  inputElement.innerText = text;
  inputElement.addEventListener("blur", onBlur);
  return inputElement;
};

const taskLists = boardContainer.querySelectorAll(".tasks");
for (const taskList of taskLists) {
  taskList.addEventListener("dragover", onDragOver);
  taskList.addEventListener("drop", onDrop);
}

boardContainer.addEventListener("click", (event) => {
  if (event.target.closest("button[data-add]")) {
    onAdd(event);
  } else if (event.target.closest("button[data-edit]")) {
    onEdit(event);
  } else if (event.target.closest("button[data-delete]")) {
    onDelete(event);
  }
});

confirmationDialog.addEventListener("submit", () => selectedTask && selectedTask.remove());
confirmationDialog.querySelector("#cancel").addEventListener("click", () => confirmationDialog.close());
confirmationDialog.addEventListener("close", () => (selectedTask = null));
