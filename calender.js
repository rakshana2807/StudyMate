// ======================================
// StudyMate Calendar
// ======================================

const monthYear = document.getElementById("monthYear");
const calendar = document.getElementById("calendar");
const monthSelect = document.getElementById("month");
const yearSelect = document.getElementById("year");
const todayBtn = document.getElementById("todayBtn");

const eventModal = document.getElementById("eventModal");
const eventModalTitle = document.getElementById("eventModalTitle");
const eventTitle = document.getElementById("eventTitle");
const eventDate = document.getElementById("eventDate");
const eventTime = document.getElementById("eventTime");
const eventCategory = document.getElementById("eventCategory");
const eventColor = document.getElementById("eventColor");
const eventDescription = document.getElementById("eventDescription");
const eventFormError = document.getElementById("eventFormError");
const saveEventBtn = document.getElementById("saveEvent");

const eventsList = document.getElementById("eventsList");
const eventsPanelDate = document.getElementById("eventsPanelDate");

const toast = document.getElementById("toast");

const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const categoryColors = {
    Study: "#1E88E5",
    Exam: "#E53935",
    Assignment: "#FB8C00",
    Meeting: "#8E24AA",
    Personal: "#43A047"
};

let events = {};

const today = new Date();
const todayKey = formatDateKey(today.getFullYear(), today.getMonth() + 1, today.getDate());

let currentMonth = today.getMonth();
let currentYear = today.getFullYear();
let selectedDate = null;

// Tracks the event currently being edited (null while adding)
let editingIndex = null;
let editingOriginalDate = null;

// ======================================
// Helpers
// ======================================

function formatDateKey(year, month, day) {

    const mm = String(month).padStart(2, "0");
    const dd = String(day).padStart(2, "0");

    return `${year}-${mm}-${dd}`;

}

function showToast(message) {

    if (!toast) return;

    toast.textContent = message;
    toast.style.opacity = "1";

    setTimeout(() => {
        toast.style.opacity = "0";
    }, 2000);

}

function showFormError(message) {

    if (eventFormError) eventFormError.textContent = message;

}

// ======================================
// Load / Save Events & Preferences
// ======================================

function loadEvents() {

    try {
        events = JSON.parse(localStorage.getItem("events")) || {};
    } catch {
        events = {};
    }

    const savedMonth = localStorage.getItem("calendarMonth");
    const savedYear = localStorage.getItem("calendarYear");
    const savedDate = localStorage.getItem("calendarSelectedDate");

    if (savedMonth !== null) currentMonth = parseInt(savedMonth);
    if (savedYear !== null) currentYear = parseInt(savedYear);
    if (savedDate) selectedDate = savedDate;

}

function saveEvents() {

    localStorage.setItem("events", JSON.stringify(events));

}

function saveCalendarPrefs() {

    localStorage.setItem("calendarMonth", currentMonth);
    localStorage.setItem("calendarYear", currentYear);

    if (selectedDate) {
        localStorage.setItem("calendarSelectedDate", selectedDate);
    }

}

// ======================================
// Populate Month / Year Dropdowns
// ======================================

months.forEach((month, index) => {

    const option = document.createElement("option");

    option.value = index;
    option.textContent = month;

    monthSelect.appendChild(option);

});

for (let year = 2020; year <= 2035; year++) {

    const option = document.createElement("option");

    option.value = year;
    option.textContent = year;

    yearSelect.appendChild(option);

}

// ======================================
// Render Calendar
// ======================================

function renderCalendar(month, year) {

    calendar.innerHTML = "";

    monthYear.textContent = `${months[month]} ${year}`;
    monthSelect.value = month;
    yearSelect.value = year;

    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    // Leading empty cells (non-interactive)
    for (let i = 0; i < firstDay; i++) {

        const empty = document.createElement("div");
        empty.classList.add("day", "empty-day");

        calendar.appendChild(empty);

    }

    // Day cells
    for (let day = 1; day <= totalDays; day++) {

        const dateKey = formatDateKey(year, month + 1, day);
        const dateCell = document.createElement("div");

        dateCell.classList.add("day");
        dateCell.textContent = day;
        dateCell.setAttribute("role", "button");
        dateCell.setAttribute("tabindex", "0");
        dateCell.setAttribute("aria-label", `${months[month]} ${day}, ${year}`);

        if (dateKey === todayKey) {
            dateCell.classList.add("today");
        } else if (dateKey < todayKey) {
            dateCell.classList.add("past");
        }

        if (dateKey === selectedDate) {
            dateCell.classList.add("selected");
        }

        const dayEvents = events[dateKey];

        if (dayEvents && dayEvents.length > 0) {

            dateCell.classList.add("has-event");

            const dots = document.createElement("div");
            dots.classList.add("event-dots");

            dayEvents.slice(0, 3).forEach(ev => {

                const dot = document.createElement("span");
                dot.classList.add("event-dot");
                dot.style.background = ev.color || categoryColors[ev.category] || "#ff4d4d";

                dots.appendChild(dot);

            });

            dateCell.appendChild(dots);

        }

        function selectThisDate() {

            selectedDate = dateKey;

            document.querySelectorAll(".day").forEach(d => d.classList.remove("selected"));
            dateCell.classList.add("selected");

            saveCalendarPrefs();
            displayEvents();

        }

        dateCell.addEventListener("click", selectThisDate);

        dateCell.addEventListener("keydown", (e) => {

            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                selectThisDate();
            }

        });

        calendar.appendChild(dateCell);

    }

}

// ======================================
// updateCalendar — single entry point for
// re-rendering + persisting navigation state
// ======================================

function updateCalendar() {

    renderCalendar(currentMonth, currentYear);
    saveCalendarPrefs();

}

// ======================================
// Navigation
// ======================================

document.getElementById("prev").addEventListener("click", () => {

    currentMonth--;

    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }

    updateCalendar();

});

document.getElementById("next").addEventListener("click", () => {

    currentMonth++;

    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }

    updateCalendar();

});

monthSelect.addEventListener("change", () => {

    currentMonth = parseInt(monthSelect.value);
    updateCalendar();

});

yearSelect.addEventListener("change", () => {

    currentYear = parseInt(yearSelect.value);
    updateCalendar();

});

if (todayBtn) {

    todayBtn.addEventListener("click", () => {

        currentMonth = today.getMonth();
        currentYear = today.getFullYear();
        selectedDate = todayKey;

        updateCalendar();
        displayEvents();

    });

}

// ======================================
// Modal — Add / Edit Event
// ======================================

const addBtn = document.getElementById("addEventBtn");
const closeBtn = document.getElementById("closeModal");
const closeModalBtn = document.getElementById("closeModalBtn");

function openEventModal() {

    showFormError("");
    eventModal.style.display = "flex";
    eventTitle.focus();

}

function closeEventModal() {

    eventModal.style.display = "none";
    editingIndex = null;
    editingOriginalDate = null;

    eventTitle.value = "";
    eventTime.value = "";
    eventDescription.value = "";
    showFormError("");

}

function resetModalForAdd() {

    eventModalTitle.textContent = "Add Event";
    editingIndex = null;
    editingOriginalDate = null;

    eventTitle.value = "";
    eventTime.value = "";
    eventDescription.value = "";
    eventCategory.value = "Study";
    eventColor.value = categoryColors.Study;
    eventDate.value = selectedDate || todayKey;

}

if (addBtn) {

    addBtn.addEventListener("click", () => {

        if (!selectedDate) {
            selectedDate = todayKey;
            saveCalendarPrefs();
            renderCalendar(currentMonth, currentYear);
        }

        resetModalForAdd();
        openEventModal();

    });

}

closeBtn.addEventListener("click", closeEventModal);
closeModalBtn.addEventListener("click", closeEventModal);

eventModal.addEventListener("click", (e) => {

    if (e.target === eventModal) closeEventModal();

});

document.addEventListener("keydown", (e) => {

    if (e.key === "Escape" && eventModal.style.display === "flex") {
        closeEventModal();
    }

});

// Auto-suggest a color whenever the category changes
eventCategory.addEventListener("change", () => {

    eventColor.value = categoryColors[eventCategory.value] || "#142850";

});

// ======================================
// Save Event (handles both Add and Edit)
// ======================================

function addEvent() {

    const title = eventTitle.value.trim();
    const date = eventDate.value;

    if (title === "") {
        showFormError("Please enter an event title.");
        return;
    }

    if (date === "") {
        showFormError("Please choose a date.");
        return;
    }

    const eventObj = {
        title: title,
        time: eventTime.value,
        description: eventDescription.value.trim(),
        category: eventCategory.value,
        color: eventColor.value
    };

    // If editing, remove the event from its original date first —
    // this also supports moving an event to a different date.
    if (editingIndex !== null && editingOriginalDate) {

        events[editingOriginalDate].splice(editingIndex, 1);

        if (events[editingOriginalDate].length === 0) {
            delete events[editingOriginalDate];
        }

    }

    if (!events[date]) events[date] = [];

    events[date].push(eventObj);

    saveEvents();

    const wasEdit = editingIndex !== null;

    selectedDate = date;

    closeEventModal();
    updateCalendar();
    displayEvents();
    refreshDashboardWidgets();

    showToast(wasEdit ? "✏️ Event Updated" : "✅ Event Added");

}

saveEventBtn.addEventListener("click", addEvent);

// ======================================
// Display Events for Selected Date
// ======================================

function formatDisplayDate(dateKey) {

    const [y, m, d] = dateKey.split("-").map(Number);

    return new Date(y, m - 1, d).toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });

}

function displayEvents() {

    if (!eventsList) return;

    if (!selectedDate) {

        eventsList.innerHTML = "<p>Select a date to view events.</p>";
        if (eventsPanelDate) eventsPanelDate.textContent = "selected date";
        return;

    }

    if (eventsPanelDate) eventsPanelDate.textContent = formatDisplayDate(selectedDate);

    const dayEvents = events[selectedDate];

    if (!dayEvents || dayEvents.length === 0) {

        eventsList.innerHTML = "<p>No events for this date.</p>";
        return;

    }

    eventsList.innerHTML = dayEvents.map((ev, index) => `

        <div class="event-item" style="border-left-color:${ev.color || categoryColors[ev.category] || "#142850"}">

            <div>

                <h4>${ev.title}</h4>

                ${ev.time ? `<p>🕒 ${ev.time}</p>` : ""}

                ${ev.description ? `<p>${ev.description}</p>` : ""}

                <span class="event-category">${ev.category || "Personal"}</span>

            </div>

            <div class="event-item-actions">

                <button type="button" title="Edit" onclick="editEvent(${index})">
                    <i class="fa-solid fa-pen"></i>
                </button>

                <button type="button" title="Delete" onclick="deleteEvent(${index})">
                    <i class="fa-solid fa-trash"></i>
                </button>

            </div>

        </div>

    `).join("");

}

// ======================================
// Edit Event
// ======================================

function editEvent(index) {

    if (!selectedDate || !events[selectedDate] || !events[selectedDate][index]) return;

    const ev = events[selectedDate][index];

    editingIndex = index;
    editingOriginalDate = selectedDate;

    eventModalTitle.textContent = "Edit Event";

    eventTitle.value = ev.title;
    eventDate.value = selectedDate;
    eventTime.value = ev.time || "";
    eventCategory.value = ev.category || "Study";
    eventColor.value = ev.color || categoryColors[ev.category] || "#142850";
    eventDescription.value = ev.description || "";

    openEventModal();

}

// ======================================
// Delete Event
// ======================================

function deleteEvent(index) {

    if (!selectedDate || !events[selectedDate]) return;

    const confirmDelete = confirm("Delete this event?");

    if (!confirmDelete) return;

    events[selectedDate].splice(index, 1);

    if (events[selectedDate].length === 0) {
        delete events[selectedDate];
    }

    saveEvents();
    displayEvents();
    renderCalendar(currentMonth, currentYear);
    refreshDashboardWidgets();

    showToast("🗑️ Event Deleted");

}

// ======================================
// Bottom Widgets — Today's Events,
// Upcoming Deadlines & Stats
// ======================================

function loadTasksFromStorage() {

    try {
        return JSON.parse(localStorage.getItem("tasks")) || [];
    } catch {
        return [];
    }

}

function renderTodaysEvents() {

    const list = document.getElementById("todaysEventsList");

    if (!list) return;

    const todays = events[todayKey];

    if (!todays || todays.length === 0) {
        list.innerHTML = "<li>No events for today.</li>";
        return;
    }

    list.innerHTML = todays
        .map(ev => `<li>${ev.title}${ev.time ? " - " + ev.time : ""}</li>`)
        .join("");

}

function renderUpcomingDeadlines() {

    const list = document.getElementById("upcomingDeadlinesList");

    if (!list) return;

    const tasks = loadTasksFromStorage();

    const upcoming = tasks
        .filter(t => !t.completed && t.dueDate && t.dueDate >= todayKey)
        .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
        .slice(0, 4);

    if (upcoming.length === 0) {
        list.innerHTML = "<li>No upcoming deadlines.</li>";
        return;
    }

    list.innerHTML = upcoming
        .map(t => `<li>${t.title} - ${t.dueDate === todayKey ? "Today" : t.dueDate}</li>`)
        .join("");

}

function renderStats() {

    const tasks = loadTasksFromStorage();

    let studySessions = 0;

    Object.values(events).forEach(dayEvents => {

        studySessions += dayEvents.filter(ev => ev.category === "Study").length;

    });

    const assignments = tasks.filter(t => t.category === "Assignment").length;

    const completed = tasks.filter(t => t.completed).length;

    const completionRate = tasks.length === 0
        ? 0
        : Math.round((completed / tasks.length) * 100);

    const streak = parseInt(localStorage.getItem("studyStreak")) || 0;

    const statSessions = document.getElementById("statSessions");
    const statAssignments = document.getElementById("statAssignments");
    const statCompletion = document.getElementById("statCompletion");
    const statStreak = document.getElementById("statStreak");

    if (statSessions) statSessions.textContent = studySessions;
    if (statAssignments) statAssignments.textContent = assignments;
    if (statCompletion) statCompletion.textContent = completionRate + "%";
    if (statStreak) statStreak.textContent = streak;

}

function refreshDashboardWidgets() {

    renderTodaysEvents();
    renderUpcomingDeadlines();
    renderStats();

}

// ======================================
// Initial Load
// ======================================

loadEvents();
renderCalendar(currentMonth, currentYear);
displayEvents();
refreshDashboardWidgets();

console.log("✅ StudyMate Calendar Loaded Successfully");