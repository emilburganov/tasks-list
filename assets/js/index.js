let tasks = JSON.parse(localStorage.getItem("tasks")) ?? [];
let subtasks = [];

let currentTab = "Активные";

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
                <button id="closeModalButton" class="button">Выйти</button>
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
 * Set completed task method
 * @param event
 * @param id
 */
const setCompetedTask = (event, id) => {
    const task = tasks.find((task) => task.id === id);

    if (task.subtasks.length && task.subtasks.find((subtask) => subtask.completed === false)) {
        event.preventDefault();
        sendErrorNotification("У задачи есть незакрытые подзадачи.");
        return;
    }

    task.completed = !task.completed;

    if (task.completed) {
        sendSuccessNotification("Задача отмечена как выполненная.");
    } else {
        sendSuccessNotification("Задача отмечена как невыполненная.");
    }

    renderTasks();
};

/**
 * Set completed subtask method
 * @param taskId
 * @param subtaskId
 * @param checkbox
 */
const setCompletedSubTask = (taskId, subtaskId, checkbox) => {
    const task = tasks.find((task) => task.id === taskId);
    const subtask = task.subtasks.find((subtask) => subtask.id === subtaskId);

    subtask.completed = !subtask.completed;

    if (subtask.completed) {
        sendSuccessNotification("Подзадача отмечена как выполненная.");
        checkbox.setAttribute("checked", "checked");
    } else {
        sendSuccessNotification("Подзадача отмечена как невыполненная.");
        checkbox.removeAttribute("checked");
    }

    if (task.subtasks.find((subtask) => subtask.completed === false)) {
        task.completed = false;
    }

    renderTasks();
}

/**
 * Delete subtask method
 * @param id
 */
const deleteSubtask = (id) => {
    subtasks = subtasks.filter((subtask) => subtask.id !== id);
    renderSubtasks();
};

/**
 * Add subtask to add task form method
 */
const addSubtaskToAddForm = () => {
    const subtaskName = subtaskNameInput.value;
    if (subtaskName === "") {
        sendErrorNotification("Название подзадачи не должно быть пустым.");
        return;
    }

    const id = Date.now();

    subtasks.push({
        id,
        name: subtaskName,
        completed: false,
    });

    subtasksList.insertAdjacentHTML("beforeend", `
        <li>
            <div class="flex ac g-20 sb">
                <div class="flex ac g-20">
                    <p>
                        ${subtaskName}
                    </p>
                </div>
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
 * Add subtask to update task form method
 */
const addSubtaskToUpdateForm = (task) => {
    const subtaskName = subtaskNameInput.value;
    if (subtaskName === "") {
        sendErrorNotification("Название подзадачи не должно быть пустым.");
        return;
    }

    const id = Date.now();

    task.subtasks.push({
        id,
        name: subtaskName,
        completed: false,
    });

    if (task.subtasks.find((subtask) => subtask.completed === false)) {
        task.completed = false;
    }

    subtasksList.insertAdjacentHTML("beforeend", `
        <li>
            <div class="flex ac g-20 sb">
                <div class="flex ac g-20">
                    <p>
                        ${subtaskName}
                    </p>
                </div>
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
        button.addEventListener("click", () => {
            task.subtasks = task.subtasks.filter((subtask) => subtask.id !== id);
            renderUpdateForm(task.id);
        });
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
        completed: false,
        date: taskDateInput.value,
        time: taskTimeInput.value,
        timestamp: taskTimestamp,
        subtasks: subtasks,
    };

    tasks.push(task);

    renderAddForm();

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

/**
 * Format date for expiration display method
 * @param timestamp
 * @returns {string}
 */
const formatTimestamp = (timestamp) => {
    if (timestamp === null) {
        return "Без даты и времени";
    }

    const currentTimestamp = Date.now();

    if (currentTimestamp > timestamp) {
        return "Просрочено";
    }

    const DAY = 86400000;

    if (timestamp - currentTimestamp <= DAY) {
        return "Сегодня";
    }

    if (timestamp - currentTimestamp > DAY && timestamp - currentTimestamp <= DAY * 2) {
        return "Завтра";
    }

    const daysLeft = Math.floor((timestamp - currentTimestamp) / DAY);

    return `Через ${daysLeft} дней(я)`;
};

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
            <div class="tabBox">
                <button class="tab">Активные</button>
                <button class="tab">Выполненные</button>
            </div>
            <div class="flex col g-20">
                <div class="flex sb wrap g-20">
                    <h3 class="title">Список задач</h3>
                    <button id="openFormButton" class="button">
                        Открыть форму
                    </button>
                </div>
            </div>

            <input type="search" class="input w-max">

            <div id="tasksList" class="flex col g-20"></div>
        </div>
    `;

    const openFormButton = document.querySelector("#openFormButton");
    openFormButton.addEventListener("click", renderAddForm);

    const tasksList = document.querySelector("#tasksList");

    let _tasks;
    if (currentTab === "Активные") {
        const activeTab = document.querySelectorAll(".tab")[0];
        activeTab.classList.add("active");
        _tasks = tasks.filter((task) => task.completed === false);
    } else {
        const completedTab = document.querySelectorAll(".tab")[1];
        completedTab.classList.add("active");
        _tasks = tasks.filter((task) => task.completed === true);
    }

    _tasks.forEach((task, index) => {
        tasksList.insertAdjacentHTML("beforeend", `
            <div class="task">
                <div class="flex ac sb g-20 wrap">
                    <div class="flex ac g-20">
                        <input
                            ${task.completed && "checked"}
                            data-id="${task.id}"
                            id="setCompletedTaskCheckbox" 
                            class="checkbox" 
                            type="checkbox"
                        >
                        <p>${task.name}</p>
                    </div>
                    <p>${formatTimestamp(task.timestamp)}</p>
                    <div class="flex ac g-20">
                        <button data-id="${task.id}" id="updateTaskButton" class="button warning-button icon-button">
                           <svg width="16" height="16" viewBox="0 0 512 512">
                               <g>
                                    <path d="M405.332 256.484c-11.797 0-21.332 9.559-21.332 21.332v170.668c0 11.754-9.559 21.332-21.332 21.332H64c-11.777 0-21.332-9.578-21.332-21.332V149.816c0-11.754 9.555-21.332 21.332-21.332h170.668c11.797 0 21.332-9.558 21.332-21.332 0-11.777-9.535-21.336-21.332-21.336H64c-35.285 0-64 28.715-64 64v298.668c0 35.286 28.715 64 64 64h298.668c35.285 0 64-28.714 64-64V277.816c0-11.796-9.54-21.332-21.336-21.332zm0 0" fill="white"></path>
                                    <path d="M200.02 237.05a10.793 10.793 0 0 0-2.922 5.438l-15.082 75.438c-.703 3.496.406 7.101 2.922 9.64a10.673 10.673 0 0 0 7.554 3.114c.68 0 1.387-.063 2.09-.211l75.414-15.082c2.09-.43 3.988-1.43 5.461-2.926l168.79-168.79-75.415-75.41zM496.383 16.102c-20.797-20.801-54.633-20.801-75.414 0l-29.524 29.523 75.414 75.414 29.524-29.527C506.453 81.465 512 68.066 512 53.816s-5.547-27.648-15.617-37.714zm0 0" fill="white"></path>
                               </g>
                           </svg>
                        </button>
                        <button data-id="${task.id}" id="deleteTaskButton" class="button danger-button icon-button">
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="white"><g>
                                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path></g>
                            </svg>
                        </button>
                    </div>
                </div>
                ${!!task.subtasks.length ? '<ul id="taskSubtasksList" class="list"></ul>' : ''}
            </div>
        `);

        if (!!task.subtasks.length) {
            const subtasksList = document.querySelectorAll("#taskSubtasksList")[index];
            subtasksList.innerHTML = "";

            task.subtasks.forEach((subtask) => {
                subtasksList.insertAdjacentHTML("beforeend", `
                    <li>
                        <div class="flex ac g-20">
                            <input
                                ${subtask.completed && "checked"}
                                data-taskId="${task.id}"
                                data-subtaskId="${subtask.id}"
                                id="setCompletedSubtaskCheckbox" 
                                class="checkbox" 
                                type="checkbox"
                            >
                            <p>${subtask.name}</p>
                        </div>
                    </li>  
                `);
            });
        }
    });

    const setCompletedSubtaskCheckboxes = document.querySelectorAll("#setCompletedSubtaskCheckbox");
    setCompletedSubtaskCheckboxes.forEach((checkbox) => {
        const taskId = Number(checkbox.dataset.taskid);
        const subtaskId = Number(checkbox.dataset.subtaskid);
        checkbox.addEventListener("click", () => {
            setCompletedSubTask(taskId, subtaskId, checkbox)
        });
    });

    const deleteTaskButtons = document.querySelectorAll("#deleteTaskButton");
    deleteTaskButtons.forEach((button) => {
        const id = Number(button.dataset.id);
        button.addEventListener("click", () => deleteTask(id));
    });

    const updateTaskButtons = document.querySelectorAll("#updateTaskButton");
    updateTaskButtons.forEach((button) => {
        const id = Number(button.dataset.id);
        button.addEventListener("click", () => renderUpdateForm(id));
    });

    const setCompletedTaskCheckboxes = document.querySelectorAll("#setCompletedTaskCheckbox");
    setCompletedTaskCheckboxes.forEach((checkbox) => {
        const id = Number(checkbox.dataset.id);
        checkbox.addEventListener("click", (event) => setCompetedTask(event, id));
    });

    const tabs = document.querySelectorAll(".tab");
    tabs.forEach((tab) => {
        tab.addEventListener("click", () => {
            tabs.forEach((tab) => {
                tab.classList.remove("active");
            });

            tab.classList.toggle("active");
            currentTab = tab.textContent;
            renderTasks();
        });
    });
};

/**
 * Render add task form method
 */
const renderAddForm = () => {
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

    addSubtaskButton.addEventListener("click", addSubtaskToAddForm);
    addTaskButton.addEventListener("click", addTask);
    openTasksButton.addEventListener("click", renderTasks);
};

renderAddForm();

openTasksButton.addEventListener("click", renderTasks);

/**
 * Render update task form method
 */
const renderUpdateForm = (id) => {
    let task = tasks.find((task) => task.id === id);

    root.innerHTML = `
        <div id="form" class="form">
            <div class="flex sb wrap g-20">
                <h3 class="title">
                    Изменить задачу
                </h3>
                <button id="openTasksButton" class="button">
                    Открыть задачи
                </button>
            </div>

            <div class="input-group">
                <label>Название</label>
                <input id="taskNameInput" type="text" class="input" value="${task.name}">
            </div>
            <div class="input-group">
                <label>Дата</label>
                <input id="taskDateInput" type="date" class="input" value="${task.date}">
            </div>
            <div class="input-group">
                <label>Время</label>
                <input id="taskTimeInput" type="time" class="input" value="${task.time}">
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
        </div>
    `;

    taskDateInput.addEventListener("change", () => {
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

        task.date = taskDateInput.value;
        task.timestamp = taskTimestamp;
    });

    taskTimeInput.addEventListener("change", () => {
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

        task.time = taskTimeInput.value;
        task.timestamp = taskTimestamp;
    });

    taskNameInput.addEventListener("change", () => {
        const taskName = taskNameInput.value;
        if (taskName === "") {
            sendErrorNotification("Название задачи не должно быть пустым.");
            return;
        }

        task.name = taskName;
    })

    if (!!task.subtasks.length) {
        const subtasksList = document.querySelector("#subtasksList");
        subtasksList.innerHTML = "";

        task.subtasks.forEach((subtask) => {
            subtasksList.insertAdjacentHTML("beforeend", `
                <li>
                    <div class="flex ac g-20 sb">
                        <div class="flex ac g-20">
                            <p>${subtask.name}</p>
                        </div>
                        <button data-id="${subtask.id}" id="deleteSubtaskButton" class="button danger-button icon-button">
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="white"><g>
                                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path></g>
                            </svg>
                        </button>
                    </div>
                </li>  
            `);
        });
    }

    const deleteSubtaskButtons = document.querySelectorAll("#deleteSubtaskButton");
    deleteSubtaskButtons.forEach((button) => {
        const id = Number(button.dataset.id);
        button.addEventListener("click", () => {
            task.subtasks = task.subtasks.filter((subtask) => subtask.id !== id);
            renderUpdateForm(task.id);
        });
    });

    addSubtaskButton.addEventListener("click", () => addSubtaskToUpdateForm(task));
    openTasksButton.addEventListener("click", renderTasks);
};

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