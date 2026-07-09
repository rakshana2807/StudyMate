// ======================================
// Current Date
// ======================================

const currentDate = document.getElementById("currentDate");

if (currentDate) {

    const today = new Date();

    const options = {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    };

    currentDate.textContent =
        today.toLocaleDateString("en-IN", options);

}


// ======================================
// Dynamic Greeting
// ======================================

const greeting = document.getElementById("greeting");

if (greeting) {

    const hour = new Date().getHours();

    let message = "";

    if (hour >= 5 && hour < 12) {

        message = "👋 Good Morning, Rakshu";

    }

    else if (hour >= 12 && hour < 17) {

        message = "☀️ Good Afternoon, Rakshu";

    }

    else if (hour >= 17 && hour < 21) {

        message = "🌇 Good Evening, Rakshu";

    }

    else {

        message = "🌙 Good Night, Rakshu";

    }

    greeting.textContent = message;

}


// ======================================
// Local Storage Data
// ======================================

const notes =
    JSON.parse(localStorage.getItem("notes")) || [];

const tasks =
    JSON.parse(localStorage.getItem("tasks")) || [];

const words =
    JSON.parse(localStorage.getItem("savedWords")) || [];

const events =
    JSON.parse(localStorage.getItem("events")) || [];


// ======================================
// Dashboard Statistics
// ======================================

const notesCount =
    document.getElementById("notesCount");

const tasksCount =
    document.getElementById("tasksCount");

const wordsCount =
    document.getElementById("wordsCount");

if (notesCount) {

    notesCount.textContent = notes.length;

}

if (tasksCount) {

    tasksCount.textContent = tasks.length;

}

if (wordsCount) {

    wordsCount.textContent = words.length;

}


// ======================================
// Study Streak
// ======================================

const streakCount =
    document.getElementById("streakCount");

if (streakCount) {

    const today = new Date();

    const todayString =
        today.toISOString().split("T")[0];

    let streak =
        parseInt(localStorage.getItem("studyStreak")) || 1;

    let lastVisit =
        localStorage.getItem("lastVisit");

    if (!lastVisit) {

        localStorage.setItem("studyStreak", streak);

        localStorage.setItem("lastVisit", todayString);

    }

    else {

        const lastDate = new Date(lastVisit);

        const diffDays = Math.floor(

            (today - lastDate) /

            (1000 * 60 * 60 * 24)

        );

        if (diffDays === 1) {

            streak++;

        }

        else if (diffDays > 1) {

            streak = 1;

        }

        localStorage.setItem("studyStreak", streak);

        localStorage.setItem("lastVisit", todayString);

    }

    streakCount.textContent = streak;

}


// ======================================
// Dashboard Search
// ======================================

const searchInput =
    document.getElementById("searchInput");

if (searchInput) {

    searchInput.addEventListener("keyup", function () {

        const value =
            this.value.toLowerCase();

        document.querySelectorAll(".task-list li")
            .forEach(item => {

                item.style.display =
                    item.textContent
                        .toLowerCase()
                        .includes(value)

                        ? ""

                        : "none";

            });

        document.querySelectorAll(".notes-list li")
            .forEach(item => {

                item.style.display =
                    item.textContent
                        .toLowerCase()
                        .includes(value)

                        ? ""

                        : "none";

            });

    });

}
// ======================================
// Word of the Day
// ======================================

const wordElement = document.getElementById("wordOfDay");
const meaningElement = document.getElementById("wordMeaning");

const wordList = [

    {
        word: "Integrity",
        meaning: "The quality of being honest and having strong moral principles."
    },

    {
        word: "Algorithm",
        meaning: "A step-by-step procedure used to solve a problem."
    },

    {
        word: "Innovation",
        meaning: "The introduction of new ideas or methods."
    },

    {
        word: "Database",
        meaning: "An organized collection of structured information."
    },

    {
        word: "Productivity",
        meaning: "The effectiveness of completing useful work."
    }

];

const randomWord =
    wordList[Math.floor(Math.random() * wordList.length)];

if (wordElement) {

    wordElement.textContent = randomWord.word;

}

if (meaningElement) {

    meaningElement.textContent = randomWord.meaning;

}


// ======================================
// Toast Message
// ======================================

function showToast(message) {

    const toast = document.getElementById("toast");

    if (!toast) return;

    toast.textContent = message;

    toast.style.opacity = "1";

    setTimeout(() => {

        toast.style.opacity = "0";

    }, 2000);

}


// ======================================
// Save Word
// ======================================

const saveWordBtn =
    document.getElementById("saveWord");

if (saveWordBtn) {

    saveWordBtn.addEventListener("click", () => {

        const word = randomWord.word;

        if (!words.includes(word)) {

            words.push(word);

            localStorage.setItem(

                "savedWords",

                JSON.stringify(words)

            );

            if (wordsCount) {

                wordsCount.textContent = words.length;

            }

            showToast("✅ Word Saved!");

        }

        else {

            showToast("⚠️ Word Already Saved");

        }

    });

}


// ======================================
// Study Progress
// ======================================

const progressFill =
    document.getElementById("progressFill");

const progressPercent =
    document.getElementById("progressPercent");

if (progressFill && progressPercent) {

    const completed =
        tasks.filter(task => task.completed).length;

    const progress =
        tasks.length === 0

            ? 0

            : Math.round((completed / tasks.length) * 100);

    progressFill.style.width =
        progress + "%";

    progressPercent.textContent =
        progress + "%";

}


// ======================================
// Progress Cards
// ======================================

const progressNotes =
    document.getElementById("progressNotes");

const progressTasks =
    document.getElementById("progressTasks");

const progressWords =
    document.getElementById("progressWords");

if (progressNotes) {

    progressNotes.textContent =
        notes.length;

}

if (progressTasks) {

    progressTasks.textContent =
        tasks.length;

}

if (progressWords) {

    progressWords.textContent =
        words.length;

}
// ======================================
// Load Recent Notes
// ======================================

const notesList = document.getElementById("notesList");

if (notesList) {

    notesList.innerHTML = "";

    if (notes.length === 0) {

        notesList.innerHTML = `
            <li>
                <i class="fa-solid fa-file-lines"></i>
                No notes available.
            </li>
        `;

    } else {

        notes
            .slice(-4)
            .reverse()
            .forEach(note => {

                notesList.innerHTML += `
                    <li>
                        <i class="fa-solid fa-file-lines"></i>
                        ${note.title}
                    </li>
                `;

            });

    }

}


// ======================================
// Load Today's Tasks
// ======================================

const taskList = document.getElementById("taskList");

if (taskList) {

    taskList.innerHTML = "";

    if (tasks.length === 0) {

        taskList.innerHTML = `
            <li>No tasks available.</li>
        `;

    } else {

        tasks
            .slice(0, 4)
            .forEach(task => {

                taskList.innerHTML += `
                    <li>

                        <input
                            type="checkbox"
                            ${task.completed ? "checked" : ""}
                            disabled>

                        <label>
                            ${task.title}
                        </label>

                    </li>
                `;

            });

    }

}


// ======================================
// Upcoming Deadlines
// ======================================

const deadlineList =
    document.getElementById("deadlineList");

if (deadlineList) {

    deadlineList.innerHTML = "";

    let hasEvents = false;

    for (const date in events) {

        events[date].forEach(event => {

            hasEvents = true;

            deadlineList.innerHTML += `

                <div class="deadline">

                    <h4>${date}</h4>

                    <p>${event.title}</p>

                    <span>${event.time || ""}</span>

                </div>

                <hr>

            `;

        });

    }

    if (!hasEvents) {

        deadlineList.innerHTML = `
            <p>No upcoming deadlines.</p>
        `;

    }

}


// ======================================
// Floating Button
// ======================================

const addButton =
    document.getElementById("addButton");

if (addButton) {

    addButton.addEventListener("click", () => {

        const choice = prompt(

`What do you want to add?

1 - Note
2 - Task
3 - Calendar Event`

        );

        switch (choice) {

            case "1":

                window.location.href = "note.html";

                break;

            case "2":

                window.location.href = "tasks.html";

                break;

            case "3":

                window.location.href = "calender.html";

                break;

            default:

                showToast("Please choose 1, 2 or 3.");

        }

    });

}


// ======================================
// Notification Bell
// ======================================

const bell =
    document.getElementById("notificationBell");

if (bell) {

    bell.addEventListener("click", () => {

        showToast("🔔 No new notifications.");

    });

}


// ======================================
// Study Hours (Simple Demo)
// ======================================

const studyHours =
    document.getElementById("studyHours");

if (studyHours) {

    studyHours.textContent =
        (notes.length + tasks.length) + " hrs";

}