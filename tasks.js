// ======================================
// StudyMate Tasks
// ======================================

let tasks = [];

// Current view state (persisted to Local Storage)
let currentFilter = localStorage.getItem("taskFilter") || "All";
let currentSort = localStorage.getItem("taskSort") || "dueDate";
let currentSearch = localStorage.getItem("taskSearch") || "";

// Track which task is being edited (by id)
let editingTaskId = null;

// ======================================
// DOM Elements
// ======================================

const pendingTasksContainer = document.getElementById("pendingTasksContainer");
const completedTasksContainer = document.getElementById("completedTasksContainer");
const pendingSection = document.getElementById("pendingSection");
const completedSection = document.getElementById("completedSection");
const emptyTaskState = document.getElementById("emptyTaskState");
const taskCount = document.getElementById("taskCount");

const taskTitle = document.getElementById("taskTitle");
const taskDescription = document.getElementById("taskDescription");
const taskDate = document.getElementById("taskDate");
const taskTime = document.getElementById("taskTime");
const taskPriority = document.getElementById("taskPriority");
const taskCategory = document.getElementById("taskCategory");
const addTaskBtn = document.getElementById("addTaskBtn");
const headerAddBtn = document.getElementById("headerAddBtn");

const searchTask = document.getElementById("searchTask");
const filterTaskSelect = document.getElementById("filterTask");
const sortTaskSelect = document.getElementById("sortTask");

const totalTasksEl = document.getElementById("totalTasks");
const pendingTasksEl = document.getElementById("pendingTasks");
const completedTasksEl = document.getElementById("completedTasks");
const highPriorityEl = document.getElementById("highPriority");

const progressFill = document.getElementById("progressFill");
const progressPercent = document.getElementById("progressPercent");

const toast = document.getElementById("toast");

const todayDate = document.getElementById("todayDate");
const scrollTopBtn = document.getElementById("scrollTopBtn");

// Edit modal elements
const taskModal = document.getElementById("taskModal");
const editTaskTitle = document.getElementById("editTaskTitle");
const editTaskDescription = document.getElementById("editTaskDescription");
const editTaskPriority = document.getElementById("editTaskPriority");
const editTaskCategory = document.getElementById("editTaskCategory");
const editTaskDate = document.getElementById("editTaskDate");
const editTaskTime = document.getElementById("editTaskTime");
const saveTaskEditBtn = document.getElementById("saveTaskEdit");
const cancelTaskEditBtn = document.getElementById("cancelTaskEdit");
const closeTaskModalBtn = document.getElementById("closeTaskModal");

// ======================================
// Helpers
// ======================================

function generateId() {

    if (window.crypto && window.crypto.randomUUID) {
        return window.crypto.randomUUID();
    }

    return "t_" + Date.now() + "_" + Math.random().toString(16).slice(2);

}

function todayISO() {

    return new Date().toISOString().split("T")[0];

}

function getTaskById(id) {

    return tasks.find(task => task.id === id);

}

// ======================================
// Load / Save Tasks
// ======================================

function loadTasks() {

    let stored = [];

    try {
        stored = JSON.parse(localStorage.getItem("tasks")) || [];
    } catch {
        stored = [];
    }

    const now = new Date().toISOString();

    // Backfill any missing fields so older saved tasks keep working
    tasks = stored.map(task => ({
        id: task.id || generateId(),
        title: task.title || "Untitled Task",
        description: task.description || "",
        dueDate: task.dueDate || (task.date && task.date !== "No Due Date" ? task.date : ""),
        dueTime: task.dueTime || "",
        priority: task.priority || "Medium",
        category: task.category || "Study",
        completed: !!task.completed,
        status: task.completed ? "Completed" : "Pending",
        createdDate: task.createdDate || now
    }));

}

function saveTasks() {

    localStorage.setItem("tasks", JSON.stringify(tasks));

    // Kept for backward compatibility with the dashboard's stat cards
    localStorage.setItem("taskCount", tasks.length);
    localStorage.setItem("completedTasks", tasks.filter(t => t.completed).length);

}

function savePreferences() {

    localStorage.setItem("taskFilter", currentFilter);
    localStorage.setItem("taskSort", currentSort);
    localStorage.setItem("taskSearch", currentSearch);

}

// ======================================
// Toast
// ======================================

function showToast(message) {

    if (!toast) return;

    toast.textContent = message;

    toast.style.opacity = "1";

    setTimeout(() => {

        toast.style.opacity = "0";

    }, 2000);

}

// ======================================
// Filter / Search / Sort Pipeline
// ======================================

function filterTasks(list) {

    const today = todayISO();

    switch (currentFilter) {

        case "Pending":
            return list.filter(t => !t.completed);

        case "Completed":
            return list.filter(t => t.completed);

        case "High":
        case "Medium":
        case "Low":
            return list.filter(t => t.priority === currentFilter);

        case "Today":
            return list.filter(t => t.dueDate === today);

        case "Overdue":
            return list.filter(t => t.dueDate && t.dueDate < today && !t.completed);

        default:
            return list;

    }

}

function searchTasks(list) {

    const term = currentSearch.trim().toLowerCase();

    if (term === "") return list;

    return list.filter(t =>
        t.title.toLowerCase().includes(term) ||
        (t.description || "").toLowerCase().includes(term)
    );

}

function sortTasks(list) {

    const sorted = [...list];

    const priorityOrder = { High: 1, Medium: 2, Low: 3 };

    switch (currentSort) {

        case "priority":
            sorted.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
            break;

        case "newest":
            sorted.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));
            break;

        case "oldest":
            sorted.sort((a, b) => new Date(a.createdDate) - new Date(b.createdDate));
            break;

        case "alphabetical":
            sorted.sort((a, b) => a.title.localeCompare(b.title));
            break;

        case "dueDate":
        default:
            sorted.sort((a, b) => {
                if (!a.dueDate && !b.dueDate) return 0;
                if (!a.dueDate) return 1;
                if (!b.dueDate) return -1;
                return a.dueDate.localeCompare(b.dueDate);
            });
            break;

    }

    return sorted;

}

function getVisibleTasks() {

    let list = filterTasks(tasks);
    list = searchTasks(list);
    list = sortTasks(list);

    return list;

}

// ======================================
// Render a single task card
// ======================================

function renderTaskCard(task) {

    const dueParts = [];

    if (task.dueDate) dueParts.push(`<i class="fa-regular fa-calendar"></i> ${task.dueDate}`);
    if (task.dueTime) dueParts.push(`<i class="fa-regular fa-clock"></i> ${task.dueTime}`);

    const dueHtml = dueParts.length
        ? dueParts.map(p => `<span>${p}</span>`).join("")
        : `<span><i class="fa-regular fa-calendar"></i> No due date</span>`;

    return `
        <div class="task-card ${task.completed ? "completed" : ""}" data-id="${task.id}">

            <div class="task-left">

                <input
                    type="checkbox"
                    ${task.completed ? "checked" : ""}
                    aria-label="Mark task complete"
                    onchange="completeTask('${task.id}')">

                <div>

                    <h3>${task.title}</h3>

                    ${task.description ? `<p>${task.description}</p>` : ""}

                    <div class="task-meta">
                        ${dueHtml}
                    </div>

                </div>

            </div>

            <div class="task-right">

                <span class="priority ${task.priority.toLowerCase()}">${task.priority}</span>

                <span class="category ${task.category.toLowerCase()}">${task.category}</span>

                <div class="task-actions">

                    <button type="button" title="Duplicate" onclick="duplicateTask('${task.id}')">
                        <i class="fa-regular fa-copy"></i>
                    </button>

                    <button type="button" title="Edit" onclick="editTask('${task.id}')">
                        <i class="fa-solid fa-pen"></i>
                    </button>

                    <button type="button" title="Delete" onclick="deleteTask('${task.id}')">
                        <i class="fa-solid fa-trash"></i>
                    </button>

                </div>

            </div>

        </div>
    `;

}

// ======================================
// Render Tasks
// ======================================

function renderTasks() {

    if (!pendingTasksContainer || !completedTasksContainer) return;

    const visible = getVisibleTasks();

    const pending = visible.filter(t => !t.completed);
    const completed = visible.filter(t => t.completed);

    pendingTasksContainer.innerHTML = pending.map(renderTaskCard).join("");
    completedTasksContainer.innerHTML = completed.map(renderTaskCard).join("");

    if (pendingSection) pendingSection.style.display = pending.length ? "block" : "none";
    if (completedSection) completedSection.style.display = completed.length ? "block" : "none";

    if (emptyTaskState) {
        emptyTaskState.style.display = visible.length === 0 ? "block" : "none";
    }

    if (taskCount) {
        taskCount.textContent = `${visible.length} Task${visible.length === 1 ? "" : "s"}`;
    }

    updateProgress();

}

// ======================================
// Add Task
// ======================================

function addTask() {

    const title = taskTitle.value.trim();

    if (title === "") {

        showToast("⚠️ Enter task title");
        taskTitle.focus();
        return;

    }

    const task = {

        id: generateId(),
        title: title,
        description: taskDescription.value.trim(),
        dueDate: taskDate.value || "",
        dueTime: taskTime.value || "",
        priority: taskPriority.value,
        category: taskCategory.value,
        completed: false,
        status: "Pending",
        createdDate: new Date().toISOString()

    };

    tasks.unshift(task);

    saveTasks();
    renderTasks();

    taskTitle.value = "";
    taskDescription.value = "";
    taskDate.value = "";
    taskTime.value = "";
    taskPriority.value = "Medium";
    taskCategory.value = "Study";

    showToast("✅ Task Added Successfully");

}

if (addTaskBtn) {
    addTaskBtn.addEventListener("click", addTask);
}

if (headerAddBtn) {

    headerAddBtn.addEventListener("click", () => {

        taskTitle.scrollIntoView({ behavior: "smooth", block: "center" });
        taskTitle.focus();

    });

}

// ======================================
// Delete Task
// ======================================

function deleteTask(id) {

    const confirmDelete = confirm("Delete this task?");

    if (!confirmDelete) return;

    tasks = tasks.filter(task => task.id !== id);

    saveTasks();
    renderTasks();

    showToast("🗑️ Task Deleted");

}

// ======================================
// Complete / Pending Toggle
// ======================================

function completeTask(id) {

    const task = getTaskById(id);

    if (!task) return;

    task.completed = !task.completed;
    task.status = task.completed ? "Completed" : "Pending";

    saveTasks();
    renderTasks();

    showToast(task.completed ? "✅ Task Completed" : "📌 Task Marked Pending");

}

// ======================================
// Duplicate Task
// ======================================

function duplicateTask(id) {

    const task = getTaskById(id);

    if (!task) return;

    const copy = {
        ...task,
        id: generateId(),
        title: `${task.title} (Copy)`,
        completed: false,
        status: "Pending",
        createdDate: new Date().toISOString()
    };

    tasks.unshift(copy);

    saveTasks();
    renderTasks();

    showToast("📄 Task Duplicated");

}

// ======================================
// Edit Task (modal)
// ======================================

function editTask(id) {

    const task = getTaskById(id);

    if (!task || !taskModal) return;

    editingTaskId = id;

    editTaskTitle.value = task.title;
    editTaskDescription.value = task.description || "";
    editTaskPriority.value = task.priority;
    editTaskCategory.value = task.category;
    editTaskDate.value = task.dueDate || "";
    editTaskTime.value = task.dueTime || "";

    taskModal.style.display = "flex";

    editTaskTitle.focus();

}

function closeTaskModal() {

    if (!taskModal) return;

    taskModal.style.display = "none";
    editingTaskId = null;

}

function saveTaskEdit() {

    if (editingTaskId === null) return;

    const task = getTaskById(editingTaskId);

    if (!task) return;

    const newTitle = editTaskTitle.value.trim();

    if (newTitle === "") {

        showToast("⚠️ Enter task title");
        editTaskTitle.focus();
        return;

    }

    task.title = newTitle;
    task.description = editTaskDescription.value.trim();
    task.priority = editTaskPriority.value;
    task.category = editTaskCategory.value;
    task.dueDate = editTaskDate.value || "";
    task.dueTime = editTaskTime.value || "";

    saveTasks();
    renderTasks();
    closeTaskModal();

    showToast("✏️ Task Updated");

}

if (saveTaskEditBtn) saveTaskEditBtn.addEventListener("click", saveTaskEdit);
if (cancelTaskEditBtn) cancelTaskEditBtn.addEventListener("click", closeTaskModal);
if (closeTaskModalBtn) closeTaskModalBtn.addEventListener("click", closeTaskModal);

if (taskModal) {

    taskModal.addEventListener("click", (e) => {

        if (e.target === taskModal) closeTaskModal();

    });

}

document.addEventListener("keydown", (e) => {

    if (e.key === "Escape" && taskModal && taskModal.style.display === "flex") {
        closeTaskModal();
    }

});

// ======================================
// Search
// ======================================

if (searchTask) {

    searchTask.value = currentSearch;

    searchTask.addEventListener("input", () => {

        currentSearch = searchTask.value;
        savePreferences();
        renderTasks();

    });

}

// ======================================
// Filter
// ======================================

if (filterTaskSelect) {

    filterTaskSelect.value = currentFilter;

    filterTaskSelect.addEventListener("change", () => {

        currentFilter = filterTaskSelect.value;
        savePreferences();
        renderTasks();

    });

}

// ======================================
// Sort
// ======================================

if (sortTaskSelect) {

    sortTaskSelect.value = currentSort;

    sortTaskSelect.addEventListener("change", () => {

        currentSort = sortTaskSelect.value;
        savePreferences();
        renderTasks();

    });

}

// ======================================
// Summary + Progress
// ======================================

function updateProgress() {

    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    const pending = total - completed;
    const high = tasks.filter(task => task.priority === "High").length;

    if (totalTasksEl) totalTasksEl.textContent = total;
    if (pendingTasksEl) pendingTasksEl.textContent = pending;
    if (completedTasksEl) completedTasksEl.textContent = completed;
    if (highPriorityEl) highPriorityEl.textContent = high;

    const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

    if (progressFill) progressFill.style.width = progress + "%";
    if (progressPercent) progressPercent.textContent = progress + "%";

}

// ======================================
// Today's Date (header)
// ======================================

if (todayDate) {

    todayDate.textContent = new Date().toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });

}

// ======================================
// Scroll-to-top Floating Button
// ======================================

if (scrollTopBtn) {

    window.addEventListener("scroll", () => {

        scrollTopBtn.classList.toggle("visible", window.scrollY > 300);

    });

    scrollTopBtn.addEventListener("click", () => {

        window.scrollTo({ top: 0, behavior: "smooth" });

    });

}

// ======================================
// Initial Load
// ======================================

loadTasks();
renderTasks();

console.log("✅ StudyMate Tasks Loaded Successfully");