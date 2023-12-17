'use strict';

const todayTodoList = document.querySelector(".today .list");
const laterTodoList = document.querySelector(".later .list");
const todoTaskText = document.querySelector(".header-add-task__input");
const todoTaskAddBtn = document.querySelector(".header-add-task__btn");
const todoTaskDate = document.getElementById("date");
const todoTaskPriority = document.querySelectorAll(".header-add-task__switch-field input");
const headerTextElement = document.querySelector(".header-title");
const progressHeroElement = document.querySelector(".progress-hero__description");
const completePercentageHeroElement = document.querySelector(".progress-hero__bar-percent");
const completePercentageBar = document.querySelector(".progress-hero__bar-input");
const seeAllButton = document.querySelector('.section-title__seeall');

let todoDB = getStoredTodoDB() || [];
let showCompleted = false;

// Инициализация приложения
function init() {
    setupEventListeners();
    render();
}

// Получение данных из localStorage
function getStoredTodoDB() {
    try {
        return JSON.parse(localStorage.getItem("todoDB")) || [];
    } catch (error) {
        console.error("Ошибка при чтении из localStorage:", error);
        return [];
    }
}

function saveTodoDB() {
    try {
        localStorage.setItem("todoDB", JSON.stringify(todoDB));
    } catch (error) {
        console.error("Ошибка при записи в localStorage:", error);
    }
}

// Добавление новой задачи
function addTask(event) {
    event.preventDefault();
    const taskText = todoTaskText.value.trim();
    if (!taskText) return alert("Введите задачу");
    if (!todoTaskDate.valueAsDate) return alert("Выберите дату");

    const task = {
        id: generateUniqueId(),
        date: todoTaskDate.valueAsDate.toLocaleDateString('en-us', { day: 'numeric', month: 'short' }),
        text: taskText,
        priority: Array.from(todoTaskPriority).find(p => p.checked)?.value || "",
        status: "pending"
    };

    todoDB.push(task);
    todoDB.sort((a, b) => compareTasks(a, b));
    saveTodoDB();
    render();
    todoTaskText.value = "";
}

// Функция сравнения для сортировки задач
function compareTasks(a, b) {
    const priorityOrder = { 'high': 1, 'medium': 2, 'low': 3 };
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return new Date(a.date) - new Date(b.date);
}

// Создание элемента задачи для отображения в списке
function createTaskElement(task) {
    const taskItem = document.createElement("li");
    const completed = task.status === "completed" ? "checked" : "";
    taskItem.classList.add("list__item");
    taskItem.setAttribute('data-task-id', task.id);
    if (task.status === "completed") {
        taskItem.classList.add("completed-task");
    }

    const taskIndicator = document.createElement("div");
    taskIndicator.classList.add("list__item-indicator", task.priority);

    const taskContent = document.createElement("div");
    taskContent.classList.add("list__item-content");

    const taskTitle = document.createElement("h3");
    taskTitle.classList.add("list__item-content-title");
    if (completed) {
        taskTitle.classList.add("checked");
    }
    taskTitle.textContent = task.text;

    const taskDate = document.createElement("div");
    taskDate.classList.add("list__item-content-date");
    taskDate.innerHTML = `
        <span class="material-symbols-outlined">
            calendar_month
        </span>
        <span class="list__item-content-text">${task.date}</span>
    `;

    taskContent.appendChild(taskTitle);
    taskContent.appendChild(taskDate);

    const taskCheck = document.createElement("div");
    taskCheck.classList.add("list__item-check");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.name = "item-done";
    checkbox.id = task.id;
    checkbox.checked = task.status === "completed";
    // checkbox.addEventListener("change", () => updateStatus(task.id));
    const checkLabel = document.createElement("label");
    checkLabel.htmlFor = task.id;

    taskCheck.appendChild(checkbox);
    taskCheck.appendChild(checkLabel);

    const taskDelete = document.createElement("div");
    taskDelete.classList.add("list__item-delete");
    taskDelete.innerHTML = `
        <span class="material-symbols-outlined">
            delete
        </span>
    `;
    taskDelete.addEventListener("click", () => deleteTask(task.id));

    taskItem.appendChild(taskIndicator);
    taskItem.appendChild(taskContent);
    taskItem.appendChild(taskCheck);
    taskItem.appendChild(taskDelete);

    return taskItem;
}

// Настройка обработчиков событий
function setupEventListeners() {
    todoTaskAddBtn.addEventListener("click", addTask);
    seeAllButton.addEventListener('click', toggleShowCompleted);
    todayTodoList.addEventListener('click', handleListClick);
    laterTodoList.addEventListener('click', handleListClick);
}

// Обработчик кликов по списку
function handleListClick(event) {
    if (event.target.matches('.list__item-delete')) {
        deleteTask(event.target.closest('.list__item').dataset.taskId);
    } else if (event.target.matches('input[type="checkbox"]')) {
        updateStatus(event.target.id);
    }
}

// Удаление задачи из списка
function deleteTask(taskId) {
    todoDB = todoDB.filter(task => task.id !== taskId);
    saveTodoDB();
    render();
}

// Переключение отображения выполненных задач
function toggleShowCompleted(event) {
    event.preventDefault();
    showCompleted = !showCompleted;
    seeAllButton.textContent = showCompleted ? 'Hide completed' : 'See all';
    const taskItems = document.querySelectorAll('.list__item');

    taskItems.forEach((taskItem) => {
        const isCompleted = taskItem.classList.contains('completed-task');
        if (!showCompleted && isCompleted) {
            // taskItem.style.display = 'none';
            taskItem.classList.add('hidden');

        } else {
            // taskItem.style.display = 'flex';
            taskItem.classList.remove('hidden');

        }
    });
}

// Генерация уникального ID для задачи
function generateUniqueId() {
    return Math.random().toString(36).substring(2) + new Date().getTime().toString(36);
}

function updateStatus(taskId) {
    console.log("Updating status for task ID:", taskId); // Дебаг
    const selectedTask = todoDB.find(task => task.id === taskId);
    if (selectedTask) {
        selectedTask.status = selectedTask.status === "pending" ? "completed" : "pending";
        saveTodoDB();
        updateTaskElementDisplay(selectedTask);
        updateTaskCount();
    }
}

function updateTaskElementDisplay(task) {
    const taskItem = document.querySelector(`[data-task-id="${task.id}"]`);
    if (!taskItem) {
        console.log("Task item not found in DOM for ID:", task.id); // Дебаг
        return;
    }
    if (taskItem) {
        const taskContentElement = taskItem.querySelector('.list__item-content-title');
        if (task.status === "completed") {
            taskContentElement.classList.add('checked');
            taskItem.classList.add('completed-task');
            if (!showCompleted) taskItem.classList.add('hidden');
        } else {
            taskContentElement.classList.remove('checked');
            taskItem.classList.remove('completed-task');
            taskItem.classList.remove('hidden');
        }
    }
}

function countTasksInTodayList() {
    return todayTodoList.childElementCount;
}

function countCompletedTasks() {
    return todoDB.filter(task => task.status === 'completed').length;
}

// Расчет процента выполненных задач
function calculateCompletionPercentage() {
    const completedTasks = countCompletedTasks();
    const totalTasks = countTasksInTodayList();

    if (totalTasks === 0) {
        return 0;
    }

    const completionPercentage = (completedTasks / totalTasks) * 100;
    return completionPercentage;
}

// Обновление счетчика задач
function updateTaskCount() {
    const todayTaskCount = countTasksInTodayList();
    const completedTaskCount = countCompletedTasks();
    const todoTaskCount = todayTaskCount - completedTaskCount;
    const completionPercentage = calculateCompletionPercentage();

    if (todoTaskCount > 0) {
        headerTextElement.innerHTML = `You have ${todoTaskCount} tasks left to complete today`;
    } else {
        headerTextElement.innerHTML = `You have no tasks left to complete today`;
    }

    if (todayTaskCount <= 0) {
        progressHeroElement.innerHTML = `You have no tasks today`;
    } else {
        if (todoTaskCount > 0) {
            progressHeroElement.innerHTML = `${completedTaskCount}/${todayTaskCount} Tasks Completed`;
        } else {
            progressHeroElement.innerHTML = `All Tasks Completed`;
        }
    }

    completePercentageHeroElement.textContent = completionPercentage.toFixed(1) + "%";
    completePercentageBar.style.setProperty('width', `${completionPercentage.toFixed(1)}%`);
}

// Отрисовка списка задач и обновление интерфейса
function render() {
    const currentDate = new Date();
    todoTaskDate.valueAsDate = currentDate;
    todayTodoList.innerHTML = "";
    laterTodoList.innerHTML = "";
    todoDB.forEach((task) => {
        const taskItem = createTaskElement(task);
        if (task.date === todoTaskDate.valueAsDate.toLocaleDateString('en-us', { day: 'numeric', month: 'short' })) {
            todayTodoList.appendChild(taskItem);
        } else {
            laterTodoList.appendChild(taskItem);
        }
        if (!showCompleted && task.status === "completed") {
            // taskItem.style.display = 'none';
            taskItem.classList.add('hidden');

        } else {
            // taskItem.style.display = 'flex';
            taskItem.classList.remove('hidden');

        }
    });
    updateTaskCount();
}

// Отрисовка текста задачи с учетом статуса и showCompleted
function renderTaskText(task, taskItems) {
    for (const taskItem of taskItems) {
        if (taskItem.getAttribute('data-task-id') === task.id) {
            const taskContentElement = taskItem.querySelector('.list__item-content-title');
            if (task.status === "completed") {
                taskContentElement.classList.add('checked');
                taskItem.classList.add('completed-task');
                taskItem.classList.add('hidden');
                // taskItem.style.display = 'none';
            } else {
                taskContentElement.classList.remove('checked');
                taskItem.classList.remove('completed-task');
                // taskItem.style.display = 'flex';
                taskItem.classList.remove('hidden');
            }
        }

    }
    updateTaskCount();
}


init();

