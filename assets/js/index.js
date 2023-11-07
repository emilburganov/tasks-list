let tasks = JSON.parse(localStorage.getItem("tasks"));
let subtasks = [];

/**
 * Close modal method
 */
const closeModal = () => {
    modalBox.classList.remove("active");
};

/**
 * Show modal method
 */
const showModal = (message, callback) => {
    modalBox.classList.add("active");

    modalBox.innerHTML = `
        <div id="modal" class="modal card">
            <h3 class="title">${message}</h3>
            <div class="flex ac g-20">
                <button id="closeModalButton" class="button">Закрыть</button>
                <button id="confirmModalButton" class="button danger-button">Удалить</button>
            </div>
        </div>
    `;

    modal.addEventListener("click", (event) => event.stopPropagation());

    confirmModalButton.addEventListener("click", () => {
        callback();
        closeModal();
    });

    closeModalButton.addEventListener("click", closeModal);
};

modalBox.addEventListener("click", closeModal);

/**
 * Delete subtask method
 * @param id
 */
const deleteSubtask = (id) => {
    subtasks = subtasks.filter((subtask) => subtask.id !== id);
    renderSubtasks();
};

/**
 * Add subtask method
 */
const addSubtask = () => {
    const subtaskName = subtaskNameInput.value;
    if (subtaskName === "") {
        sendErrorNotification("Название подзадачи не должно быть пустым.");
        return;
    }

    const id = Date.now();

    subtasks.push({
        id,
        name: subtaskName,
    });

    subtasksList.insertAdjacentHTML("beforeend", `
        <li>
            <div class="flex ac g-20">
                <p class="w-max">
                    ${subtaskName}
                </p>
                <button data-id="${id}" id="deleteSubtaskButton" class="button danger-button icon-button">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="white"><g>
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path></g>
                    </svg>
                </button>
            </div>
        </li>  
    `);

    subtaskNameInput.value = "";

    const deleteSubtaskButtons = document.querySelectorAll("#deleteSubtaskButton");
    deleteSubtaskButtons.forEach((button) => {
        const id = Number(button.dataset.id);
        button.addEventListener("click", () => deleteSubtask(id));
    });
};

/**
 * Add task method
 */
const addTask = () => {
    const taskName = taskNameInput.value;
    if (taskName === "") {
        sendErrorNotification("Название задачи не должно быть пустым.");
        return;
    }

    let taskTimestamp = null;

    if (taskDateInput.value !== "" && taskTimeInput.value !== "") {
        const taskISODate = taskDateInput.value + "T" + taskTimeInput.value;
        taskTimestamp = (new Date(taskISODate)).getTime();
    }

    if (taskTimestamp !== null && taskTimestamp < Date.now()) {
        sendErrorNotification("Дата и время должны быть не раньше сегодняшнего дня и текущего времени.");
        return;
    }

    if (taskDateInput.value === "" && taskTimeInput.value !== "") {
        sendErrorNotification("Вы ввели время но не выбрали дату.");
        return;
    }

    if (taskDateInput.value !== "" && taskTimeInput.value === "") {
        sendErrorNotification("Вы ввели дату но не выбрали время.");
        return;
    }


    const task = {
        id: Date.now(),
        name: taskName,
        timestamp: taskTimestamp,
        subtasks: subtasks,
    };

    tasks.push(task);

    renderForm();

    sendSuccessNotification("Задача успешно создана.");
};

/**
 * Delete task method
 * @param id
 */
const deleteTask = (id) => {
    const callback = () => {
        tasks = tasks.filter((task) => task.id !== id);
        renderTasks();
    };

    showModal("Вы уверены что хотите удалить задачу?", callback);
};

const formatTimestamp = (timestamp) => {
    if (timestamp === null) {
        return "Без даты и времени";
    }

    const currentTimestamp = Date.now();

    if (currentTimestamp > timestamp) {
        return "Просрочено";
    }

    const DAY = 86400 * 1000;

    if (timestamp - currentTimestamp <= DAY) {
        return "Сегодня";
    }

    if (timestamp - currentTimestamp > DAY && timestamp - currentTimestamp <= DAY * 2) {
        return "Завтра";
    }

    const daysLeft = Math.floor((timestamp - currentTimestamp) / DAY);

    return `Через ${daysLeft} дней(я)`;
}

/**
 * Render subtask list method
 */
const renderSubtasks = () => {
    subtasksList.innerHTML = "";

    subtasks.forEach((subtask) => {
        subtasksList.insertAdjacentHTML("beforeend", `
            <li>
                <div class="flex ac g-20">
                    <p class="w-max">
                        ${subtask.name}
                    </p>
                    <button data-id="${subtask.id}" id="deleteSubtaskButton" class="button danger-button icon-button">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="white"><g>
                            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path></g>
                        </svg>
                    </button>
                </div>
            </li>  
        `);
    });

    const deleteSubtaskButtons = document.querySelectorAll("#deleteSubtaskButton");
    deleteSubtaskButtons.forEach((button) => {
        const id = Number(button.dataset.id);
        button.addEventListener("click", () => deleteSubtask(id));
    });
};

/**
 * Render task list method
 */
const renderTasks = () => {
    root.innerHTML = `
        <div class="flex col g-20">
            <div class="flex col g-20">
                <div class="flex sb wrap g-20">
                    <h3 class="title">Список задач</h3>
                    <button id="openFormButton" class="button">
                        Открыть форму
                    </button
                </div>
            </div>
            
            <input type="search" class="input w-max">

            <div id="tasksList" class="flex col g-20 "></div>
        </div>
    `;

    const openFormButton = document.querySelector("#openFormButton");
    openFormButton.addEventListener("click", renderForm);

    const tasksList = document.querySelector("#tasksList");

    tasks.forEach((task) => {
        tasksList.insertAdjacentHTML("beforeend", `
            <div class="task">
                <div class="flex ac g-20">
                    <input class="checkbox" type="checkbox">
                    <p>${task.name}</p>
                </div>
                <p>${formatTimestamp(task.timestamp)}</p>
                <button data-id="${task.id}" id="deleteTaskButton" class="button danger-button icon-button">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="white"><g>
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path></g>
                    </svg>
                </button>
            </div>
        `);
    });

    const deleteTaskButtons = document.querySelectorAll("#deleteTaskButton");
    deleteTaskButtons.forEach((button) => {
        const id = Number(button.dataset.id);
        button.addEventListener("click", () => deleteTask(id));
    });
};

/**
 * Render add task form method
 */
const renderForm = () => {
    root.innerHTML = `
        <div id="form" class="form">
            <div class="flex sb wrap g-20">
                <h3 class="title">
                    Создать новую задачу
                </h3>
                <button id="openTasksButton" class="button">
                    Открыть задачи
                </button>
            </div>

            <div class="input-group">
                <label>Название</label>
                <input id="taskNameInput" type="text" class="input">
            </div>
            <div class="input-group">
                <label>Дата</label>
                <input id="taskDateInput" type="date" class="input">
            </div>
            <div class="input-group">
                <label>Время</label>
                <input id="taskTimeInput" type="time" class="input">
            </div>

            <div class="flex g-20 ae">
                <div class="input-group w-max">
                    <label>Название подзадачи</label>
                    <input id="subtaskNameInput" type="text" class="input">
                </div>
                <button id="addSubtaskButton" class="button">
                    Добавить
                </button>
            </div>

            <ul id="subtasksList" class="list"></ul>

            <button id="addTaskButton" type="submit" class="button">
                Создать задачу
            </button>
        </div>
    `;

    addSubtaskButton.addEventListener("click", addSubtask);
    addTaskButton.addEventListener("click", addTask);
    openTasksButton.addEventListener("click", renderTasks);
};

renderForm();

openTasksButton.addEventListener("click", renderTasks);

/**
 * Send error notification method
 * @param message
 */
const sendErrorNotification = (message) => {
    notificationBox.insertAdjacentHTML("beforeend", `
        <div class="notification">
            <svg width="16" height="16" viewBox="0 0 64 64"><g><path d="M59.316 49.412 36.33 9.6c-1.755-3.291-6.905-3.299-8.66 0L4.684 49.412c-1.971 3.167.596 7.629 4.331 7.5h45.971c3.729.125 6.309-4.33 4.331-7.5zM32 50c-2.638-.067-2.637-3.934 0-4 2.638.067 2.637 3.934 0 4zm3.511-24.576L33.142 42.01c-.171 1.293-2.111 1.302-2.283 0L28.49 25.424A3 3 0 0 1 31.46 22h1.082a3 3 0 0 1 2.97 3.424z" fill="#ff2444"></path></g></svg>
            ${message}
        </div>
    `);

    setTimeout(() => {
        const notification = notificationBox.querySelector(".notification");
        notificationBox.removeChild(notification);
    }, 4000);
};

/**
 * Send success notification method
 * @param message
 */
const sendSuccessNotification = (message) => {
    notificationBox.insertAdjacentHTML("beforeend", `
        <div class="notification success">
            <svg width="16" height="16" viewBox="0 0 64 64"><g><path d="M59.316 49.412 36.33 9.6c-1.755-3.291-6.905-3.299-8.66 0L4.684 49.412c-1.971 3.167.596 7.629 4.331 7.5h45.971c3.729.125 6.309-4.33 4.331-7.5zM32 50c-2.638-.067-2.637-3.934 0-4 2.638.067 2.637 3.934 0 4zm3.511-24.576L33.142 42.01c-.171 1.293-2.111 1.302-2.283 0L28.49 25.424A3 3 0 0 1 31.46 22h1.082a3 3 0 0 1 2.97 3.424z" fill="#198754"></path></g></svg>
            ${message}
        </div>
    `);

    setTimeout(() => {
        const notification = notificationBox.querySelector(".notification");
        notificationBox.removeChild(notification);
    }, 4000);
};

/**
 * Save tasks to localstorage
 */
window.addEventListener("beforeunload", () => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
});