// ======================================
// StudyMate Notes
// ======================================

// Load Notes
let notes = JSON.parse(localStorage.getItem("notes")) || [];

// DOM Elements
const notesContainer = document.getElementById("notesContainer");
const pinnedContainer = document.getElementById("pinnedNotes");
const emptyState = document.getElementById("emptyState");

const noteTitle = document.getElementById("noteTitle");
const noteContent = document.getElementById("noteContent");
const pinNote = document.getElementById("pinNote");

const noteCount = document.getElementById("noteCount");
const pinnedCount = document.getElementById("pinnedCount");

// ======================================
// Save Notes
// ======================================

function saveNotes() {

    localStorage.setItem(
        "notes",
        JSON.stringify(notes)
    );

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
// Render Notes
// ======================================

function renderNotes(search = "") {

    if (!notesContainer || !pinnedContainer) return;

    notesContainer.innerHTML = "";
    pinnedContainer.innerHTML = "";

    let pinned = 0;
    let total = 0;

    const filteredNotes = notes.filter(note => {

        return (
            note.title.toLowerCase().includes(search.toLowerCase()) ||
            note.content.toLowerCase().includes(search.toLowerCase())
        );

    });

    if (filteredNotes.length === 0) {

        if (emptyState)
            emptyState.style.display = "block";

    } else {

        if (emptyState)
            emptyState.style.display = "none";

    }

    filteredNotes.forEach((note, index) => {

        total++;

        const card = document.createElement("div");

        card.className = "note-card";

        card.innerHTML = `

            <div class="note-top">

                <h4>${note.title}</h4>

                <i class="fa-solid fa-thumbtack"
                   style="opacity:${note.pinned ? 1 : 0.3}"></i>

            </div>

            <p>${note.content}</p>

            <div class="note-footer">

                <span>${note.date}</span>

                <div class="note-actions">

                    <i class="fa-solid fa-pen"
                       onclick="editNote(${index})"></i>

                    <i class="fa-solid fa-trash"
                       onclick="deleteNote(${index})"></i>

                    <i class="fa-solid fa-thumbtack"
                       onclick="togglePin(${index})"></i>

                </div>

            </div>

        `;

        if (note.pinned) {

            pinned++;

            pinnedContainer.appendChild(card);

        } else {

            notesContainer.appendChild(card);

        }

    });

    if (noteCount)
        noteCount.textContent = `${total} Notes`;

    if (pinnedCount)
        pinnedCount.textContent = `${pinned} Pinned`;

}

// ======================================
// Initial Load
// ======================================

renderNotes();
// ======================================
// Add Note
// ======================================

const addNoteBtn = document.getElementById("addNoteBtn");

if (addNoteBtn) {

    addNoteBtn.addEventListener("click", () => {

        const title = noteTitle.value.trim();
        const content = noteContent.value.trim();

        if (title === "" || content === "") {

            alert("Please enter both title and content.");
            return;

        }

        const newNote = {

            title: title,
            content: content,
            pinned: pinNote.checked,
            date: new Date().toLocaleString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            })

        };

        notes.unshift(newNote);

        saveNotes();

        renderNotes();

        noteTitle.value = "";
        noteContent.value = "";
        pinNote.checked = false;

        showToast("✅ Note Added Successfully");

    });

}


// ======================================
// Delete Note
// ======================================

function deleteNote(index) {

    const confirmDelete = confirm(
        "Are you sure you want to delete this note?"
    );

    if (!confirmDelete) return;

    notes.splice(index, 1);

    saveNotes();

    renderNotes();

    showToast("🗑️ Note Deleted");

}


// ======================================
// Pin / Unpin Note
// ======================================

function togglePin(index) {

    notes[index].pinned = !notes[index].pinned;

    saveNotes();

    renderNotes();

    if (notes[index].pinned) {

        showToast("📌 Note Pinned");

    } else {

        showToast("📌 Note Unpinned");

    }

}
// ======================================
// Edit Note
// ======================================

function editNote(index) {

    const note = notes[index];

    const newTitle = prompt(
        "Edit Note Title",
        note.title
    );

    if (newTitle === null) return;

    const newContent = prompt(
        "Edit Note Content",
        note.content
    );

    if (newContent === null) return;

    notes[index].title = newTitle.trim();
    notes[index].content = newContent.trim();

    notes[index].date = new Date().toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });

    saveNotes();

    renderNotes();

    showToast("✏️ Note Updated");

}
// ======================================
// Search Notes
// ======================================

const searchNote = document.getElementById("searchNote");

if (searchNote) {

    searchNote.addEventListener("keyup", () => {

        renderNotes(searchNote.value);

    });

}
// ======================================
// Export Notes
// ======================================

const exportBtn = document.getElementById("exportNotes");

if (exportBtn) {

    exportBtn.addEventListener("click", () => {

        const data = JSON.stringify(notes, null, 2);

        const blob = new Blob([data], {
            type: "application/json"
        });

        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");

        a.href = url;

        a.download = "StudyMate_Notes.json";

        a.click();

        URL.revokeObjectURL(url);

        showToast("📥 Notes Exported");

    });

}
// ======================================
// Import Notes
// ======================================

const importInput = document.getElementById("importNotes");

if(importInput){

    importInput.addEventListener("change", function(){

        const file = this.files[0];

        if(!file) return;

        const reader = new FileReader();

        reader.onload = function(e){

            try{

                const importedNotes =
                JSON.parse(e.target.result);

                notes = importedNotes;

                saveNotes();

                renderNotes();

                showToast("📂 Notes Imported");

            }

            catch{

                alert("Invalid JSON File");

            }

        };

        reader.readAsText(file);

    });

}