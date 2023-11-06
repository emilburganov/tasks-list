const notifications = document.querySelector("#notificationBox");

let tasks = [];
let subtasks = [];

const subtasksList = document.querySelector("#subtasksList");
const addSubtaskButton = document.querySelector("#addSubtaskButton");

const addTaskButton = document.querySelector("#addTaskButton");

const taskFormCredentials = {
    name: "",
    deadline: null,
};

const subtaskFormCredentials = {
    name: "",
};

const pushNotification = (message) => {
    notifications.insertAdjacentHTML("beforeend", `
        <div class="notification">
            <svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="16" height="16" x="0" y="0" viewBox="0 0 64 64" style="enable-background:new 0 0 512 512" xml:space="preserve" class="hovered-paths"><g><path d="M59.316 49.412 36.33 9.6c-1.755-3.291-6.905-3.299-8.66 0L4.684 49.412c-1.971 3.167.596 7.629 4.331 7.5h45.971c3.729.125 6.309-4.33 4.331-7.5zM32 50c-2.638-.067-2.637-3.934 0-4 2.638.067 2.637 3.934 0 4zm3.511-24.576L33.142 42.01c-.171 1.293-2.111 1.302-2.283 0L28.49 25.424A3 3 0 0 1 31.46 22h1.082a3 3 0 0 1 2.97 3.424z" fill="#ff2444" opacity="1" data-original="#000000" class="hovered-path"></path></g></svg>
            ${message}
        </div>
    `);
};

const addSubtask = (event) => {
    event.preventDefault();

    if (subtasks.find((subtask) => subtask.name === "")) {
        return pushNotification("You have unfilled subtasks.");
    }

    subtasks.push({
        id: Date.now(),
        name: "",
    });

    subtasksList.insertAdjacentHTML("beforeend", `
        <li>
            <div class="input-group">
                <label>Name</label>
                <input 
                    type="text"
                    class="input"
                >
            </div>
        </li>  
    `);

};

addSubtaskButton.addEventListener("click", addSubtask);

const addTask = (event) => {
    event.preventDefault();
};

addTaskButton.addEventListener("click", addTask);