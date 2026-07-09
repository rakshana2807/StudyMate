
// DOM Elements
// ======================================
// ======================================
// Local Storage
// ======================================
// ======================================
// Toast
// ======================================
// ======================================
// Search Word
// ======================================
// ======================================
// Pronunciation
// ======================================
// ======================================
// Save Word
// ======================================
// ======================================
// Load Saved Words
// ======================================
// ======================================
// Delete Word
// ======================================
// ======================================
// Clear All
// ======================================
// ======================================
// Dashboard Sync
// ======================================
// ======================================
// Initial Load
// ======================================
// ======================================
// StudyMate Dictionary
// ======================================
 
// ======================================
// DOM Elements
// ======================================
 
const wordInput = document.getElementById("wordInput");
const searchBtn = document.getElementById("searchBtn");
 
const wordEl = document.getElementById("word");
const phoneticEl = document.getElementById("phonetic");
const partOfSpeechEl = document.getElementById("partOfSpeech");
const meaningEl = document.getElementById("meaning");
const exampleEl = document.getElementById("example");
 
const pronounceBtn = document.getElementById("pronounceBtn");
const copyBtn = document.getElementById("copyBtn");
const saveWordBtn = document.getElementById("saveWord");
 
const savedWordsList = document.getElementById("savedWordsList");
const clearWordsBtn = document.getElementById("clearWords");
 
const toast = document.getElementById("toast");
 
const API_URL = "https://api.dictionaryapi.dev/api/v2/entries/en/";
 
// A small pool of everyday words used to load a random word on first open
const randomWordPool = [
    "serendipity", "resilience", "curious", "harmony", "eloquent",
    "gratitude", "wander", "vivid", "diligent", "insight",
    "clarity", "momentum", "genuine", "flourish", "candid"
];
 
let currentWordData = null;
let currentAudioUrl = "";
 
// ======================================
// Local Storage
// ======================================
 
function loadSavedWords() {
 
    try {
        return JSON.parse(localStorage.getItem("savedWords")) || [];
    } catch {
        return [];
    }
 
}
 
function storeSavedWords(savedWords) {
 
    localStorage.setItem("savedWords", JSON.stringify(savedWords));
 
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
// Search Word
// ======================================
 
async function searchWord(term) {
 
    const query = (term || wordInput.value).trim();
 
    if (query === "") {
        showToast("⚠️ Please enter a word");
        return;
    }
 
    wordEl.textContent = "Searching...";
    phoneticEl.textContent = "";
    partOfSpeechEl.textContent = "";
    meaningEl.textContent = "";
    exampleEl.textContent = "";
 
    try {
 
        const response = await fetch(API_URL + encodeURIComponent(query));
 
        if (!response.ok) {
            throw new Error("Word not found");
        }
 
        const data = await response.json();
 
        displayWord(data[0]);
 
    } catch (error) {
 
        wordEl.textContent = query;
        phoneticEl.textContent = "No definition found.";
        partOfSpeechEl.textContent = "";
        meaningEl.textContent = "Please check the spelling and try again.";
        exampleEl.textContent = "";
 
        currentWordData = null;
        currentAudioUrl = "";
 
        showToast("❌ Word not found");
 
    }
 
}
 
function displayWord(data) {
 
    currentWordData = data;
 
    const meaning = data.meanings && data.meanings[0];
    const definitionEntry = meaning && meaning.definitions && meaning.definitions[0];
 
    const phoneticText = data.phonetic
        || (data.phonetics.find(p => p.text) || {}).text
        || "";
 
    const audioEntry = data.phonetics.find(p => p.audio);
    currentAudioUrl = audioEntry ? audioEntry.audio : "";
 
    wordEl.textContent = data.word;
    phoneticEl.textContent = phoneticText || "No phonetic spelling available.";
    partOfSpeechEl.textContent = meaning ? meaning.partOfSpeech : "";
    meaningEl.textContent = definitionEntry ? definitionEntry.definition : "No meaning found.";
    exampleEl.textContent = definitionEntry && definitionEntry.example
        ? `"${definitionEntry.example}"`
        : "";
 
    showToast(`✅ Showing results for "${data.word}"`);
 
}
 
searchBtn.addEventListener("click", () => searchWord());
 
wordInput.addEventListener("keydown", (e) => {
 
    if (e.key === "Enter") {
        e.preventDefault();
        searchWord();
    }
 
});
 
// ======================================
// Pronunciation
// ======================================
 
function pronounceWord() {
 
    if (!currentWordData) {
        showToast("⚠️ Search a word first");
        return;
    }
 
    if (currentAudioUrl) {
 
        const audio = new Audio(currentAudioUrl);
        audio.play();
 
    } else if ("speechSynthesis" in window) {
 
        const utterance = new SpeechSynthesisUtterance(currentWordData.word);
        speechSynthesis.speak(utterance);
 
    } else {
 
        showToast("⚠️ Pronunciation not available");
 
    }
 
}
 
pronounceBtn.addEventListener("click", pronounceWord);
 
// ======================================
// Copy Word
// ======================================
 
function copyWord() {
 
    if (!currentWordData) {
        showToast("⚠️ Search a word first");
        return;
    }
 
    navigator.clipboard.writeText(currentWordData.word)
        .then(() => showToast("📋 Word Copied"))
        .catch(() => showToast("❌ Copy failed"));
 
}
 
copyBtn.addEventListener("click", copyWord);
 
// ======================================
// Save Word
// ======================================
 
function saveWord() {
 
    if (!currentWordData) {
        showToast("⚠️ Search a word first");
        return;
    }
 
    const meaning = currentWordData.meanings && currentWordData.meanings[0];
    const definitionEntry = meaning && meaning.definitions && meaning.definitions[0];
 
    const savedWords = loadSavedWords();
 
    const alreadySaved = savedWords.some(w => w.word.toLowerCase() === currentWordData.word.toLowerCase());
 
    if (alreadySaved) {
        showToast("⚠️ Word already saved");
        return;
    }
 
    const wordObj = {
        word: currentWordData.word,
        partOfSpeech: meaning ? meaning.partOfSpeech : "",
        meaning: definitionEntry ? definitionEntry.definition : ""
    };
 
    savedWords.unshift(wordObj);
    storeSavedWords(savedWords);
 
    renderSavedWords();
    refreshDashboardSync();
 
    showToast("⭐ Word Saved");
 
}
 
saveWordBtn.addEventListener("click", saveWord);
 
// ======================================
// Load Saved Words
// ======================================
 
function renderSavedWords() {
 
    const savedWords = loadSavedWords();
 
    if (savedWords.length === 0) {
        savedWordsList.innerHTML = "<li>No saved words.</li>";
        return;
    }
 
    savedWordsList.innerHTML = savedWords.map((w, index) => `
 
        <li class="saved-word-item">
 
            <div class="saved-word-info">
 
                <i class="fa-solid fa-book-bookmark"></i>
 
                <div>
                    <strong>${w.word}</strong>
                    <small>${w.partOfSpeech ? w.partOfSpeech + " — " : ""}${w.meaning}</small>
                </div>
 
            </div>
 
            <button type="button" class="delete-word-btn" title="Delete" onclick="deleteWord(${index})">
                <i class="fa-solid fa-trash"></i>
            </button>
 
        </li>
 
    `).join("");
 
}
 
// ======================================
// Delete Word
// ======================================
 
function deleteWord(index) {
 
    const savedWords = loadSavedWords();
 
    savedWords.splice(index, 1);
    storeSavedWords(savedWords);
 
    renderSavedWords();
    refreshDashboardSync();
 
    showToast("🗑️ Word Removed");
 
}
 
// ======================================
// Clear All
// ======================================
 
function clearAllWords() {
 
    const savedWords = loadSavedWords();
 
    if (savedWords.length === 0) {
        showToast("⚠️ No saved words to clear");
        return;
    }
 
    const confirmClear = confirm("Clear all saved words?");
 
    if (!confirmClear) return;
 
    storeSavedWords([]);
 
    renderSavedWords();
    refreshDashboardSync();
 
    showToast("🗑️ All Words Cleared");
 
}
 
clearWordsBtn.addEventListener("click", clearAllWords);
 
// ======================================
// Dashboard Sync
// ======================================
 
function refreshDashboardSync() {
 
    const savedWords = loadSavedWords();
 
    localStorage.setItem("savedWordsCount", savedWords.length);
 
}
 
// ======================================
// Initial Load
// ======================================
 
function loadRandomWord() {
 
    const randomIndex = Math.floor(Math.random() * randomWordPool.length);
    const randomWord = randomWordPool[randomIndex];
 
    searchWord(randomWord);
 
}
 
renderSavedWords();
refreshDashboardSync();
loadRandomWord();
 
console.log("✅ StudyMate Dictionary Loaded Successfully");
 
