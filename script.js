const tasks = document.querySelectorAll('.task');
const columns = document.querySelectorAll('.column');

tasks.forEach(task => {
    task.addEventListener('dragstart', () => {
        task.classList.add('dragging');
    });

    task.addEventListener('dragend', () => {
        task.classList.remove('dragging');
    });
});

columns.forEach(column => {
    column.addEventListener('dragover', event => {
        event.preventDefault();
        const draggingTask = document.querySelector('.dragging');
        column.appendChild(draggingTask);
    });

    column.addEventListener('dragenter', () => {
        column.classList.add('drop');
    });

    column.addEventListener('dragleave', () => {
        column.classList.remove('drop');
    });

    column.addEventListener('drop', () => {
        column.classList.remove('drop');
    });
});
