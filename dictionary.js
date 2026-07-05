// ======================================
// Dictionary Elements
// ======================================

const wordInput = document.getElementById("wordInput");

const searchBtn = document.getElementById("searchBtn");

const word = document.getElementById("word");

const phonetic = document.getElementById("phonetic");

const partOfSpeech = document.getElementById("partOfSpeech");

const meaning = document.getElementById("meaning");

const example = document.getElementById("example");

const saveWordBtn = document.getElementById("saveWord");

const savedWordsList = document.getElementById("savedWordsList");

const clearWordsBtn = document.getElementById("clearWords");

const toast = document.getElementById("toast");

let currentWord = "";

let currentMeaning = "";


// ======================================
// Toast Notification
// ======================================

function showToast(message) {

    toast.textContent = message;

    toast.style.opacity = "1";

    setTimeout(() => {

        toast.style.opacity = "0";

    }, 2000);

}


// ======================================
// Search Button
// ======================================

if (searchBtn) {

    searchBtn.addEventListener("click", searchWord);

}


// ======================================
// Press Enter to Search
// ======================================

if (wordInput) {

    wordInput.addEventListener("keypress", function (e) {

        if (e.key === "Enter") {

            searchWord();

        }

    });

}


// ======================================
// Search Word
// ======================================

async function searchWord() {

    const searchText = wordInput.value.trim();

    if (searchText === "") {

        showToast("⚠️ Enter a word.");

        return;

    }

    word.textContent = "Searching...";

    phonetic.textContent = "";

    partOfSpeech.textContent = "";

    meaning.textContent = "Please wait...";

    example.textContent = "";

    try {

        const response = await fetch(

            `https://api.dictionaryapi.dev/api/v2/entries/en/${searchText}`

        );

        if (!response.ok) {

            throw new Error("Word not found");

        }

        const data = await response.json();

        const result = data[0];

        currentWord = result.word;

        currentMeaning =
            result.meanings[0].definitions[0].definition;

        word.textContent = result.word;

        phonetic.textContent =
            result.phonetic || "No pronunciation available";

        partOfSpeech.textContent =
            result.meanings[0].partOfSpeech;

        meaning.textContent =
            result.meanings[0].definitions[0].definition;

        example.textContent =
            result.meanings[0].definitions[0].example ||
            "No example available.";

    }

    catch (error) {

        currentWord = "";

        currentMeaning = "";

        word.textContent = "❌ Word Not Found";

        phonetic.textContent = "";

        partOfSpeech.textContent = "";

        meaning.textContent =
            "Please check the spelling and try again.";

        example.textContent = "";

        showToast("❌ Word not found.");

    }

}
// ======================================
// Save Word
// ======================================

if (saveWordBtn) {

    saveWordBtn.addEventListener("click", () => {

        if (currentWord === "") {

            showToast("⚠️ Search a word first.");

            return;

        }

        let savedWords = JSON.parse(
            localStorage.getItem("savedWords")
        ) || [];

        const exists = savedWords.some(item => item.word === currentWord);

        if (exists) {

            showToast("⚠️ Word already saved.");

            return;

        }

        savedWords.push({

            word: currentWord,

            meaning: currentMeaning

        });

        localStorage.setItem(

            "savedWords",

            JSON.stringify(savedWords)

        );

        loadSavedWords();

        showToast("✅ Word saved successfully!");

    });

}


// ======================================
// Load Saved Words
// ======================================

function loadSavedWords() {

    if (!savedWordsList) return;

    let savedWords = JSON.parse(
        localStorage.getItem("savedWords")
    ) || [];

    savedWordsList.innerHTML = "";

    if (savedWords.length === 0) {

        savedWordsList.innerHTML = `
            <li>No saved words.</li>
        `;

        return;

    }

    savedWords.forEach((item, index) => {

        savedWordsList.innerHTML += `

            <li>

                <div class="saved-word">

                    <i class="fa-solid fa-book"></i>

                    <div>

                        <strong>${item.word}</strong>

                        <br>

                        <small>${item.meaning}</small>

                    </div>

                </div>

                <button
                    class="delete-btn"
                    onclick="deleteWord(${index})">

                    Delete

                </button>

            </li>

        `;

    });

}


// ======================================
// Delete Word
// ======================================

function deleteWord(index) {

    let savedWords = JSON.parse(
        localStorage.getItem("savedWords")
    ) || [];

    savedWords.splice(index, 1);

    localStorage.setItem(

        "savedWords",

        JSON.stringify(savedWords)

    );

    loadSavedWords();

    showToast("🗑️ Word deleted.");

}


// ======================================
// Clear All Words
// ======================================

if (clearWordsBtn) {

    clearWordsBtn.addEventListener("click", () => {

        const confirmDelete = confirm(

            "Delete all saved words?"

        );

        if (!confirmDelete) return;

        localStorage.removeItem("savedWords");

        loadSavedWords();

        showToast("🧹 All words cleared.");

    });

}


// ======================================
// Load Saved Words on Startup
// ======================================

loadSavedWords();
// ======================================
// Dashboard Word Count
// ======================================

function updateDashboardWordCount() {

    const savedWords = JSON.parse(
        localStorage.getItem("savedWords")
    ) || [];

    localStorage.setItem(
        "dictionaryCount",
        savedWords.length
    );

}


// ======================================
// Update Dashboard After Changes
// ======================================

const originalLoadSavedWords = loadSavedWords;

loadSavedWords = function () {

    originalLoadSavedWords();

    updateDashboardWordCount();

};


// ======================================
// Copy Word
// ======================================

const copyBtn = document.createElement("button");

copyBtn.textContent = "📋 Copy Word";

copyBtn.className = "save-btn";

copyBtn.style.marginLeft = "10px";

if (saveWordBtn) {

    saveWordBtn.insertAdjacentElement(
        "afterend",
        copyBtn
    );

}

copyBtn.addEventListener("click", () => {

    if (currentWord === "") {

        showToast("⚠️ Search a word first.");

        return;

    }

    navigator.clipboard.writeText(currentWord);

    showToast("📋 Word copied!");

});


// ======================================
// Pronunciation Audio
// ======================================

const audioBtn = document.createElement("button");

audioBtn.textContent = "🔊 Pronounce";

audioBtn.className = "save-btn";

audioBtn.style.marginLeft = "10px";

copyBtn.insertAdjacentElement(
    "afterend",
    audioBtn
);

audioBtn.addEventListener("click", async () => {

    if (currentWord === "") {

        showToast("⚠️ Search a word first.");

        return;

    }

    try {

        const response = await fetch(

            `https://api.dictionaryapi.dev/api/v2/entries/en/${currentWord}`

        );

        const data = await response.json();

        const phonetics = data[0].phonetics;

        const audio = phonetics.find(

            p => p.audio && p.audio !== ""

        );

        if (audio) {

            new Audio(audio.audio).play();

        }

        else {

            showToast("🔇 Audio unavailable.");

        }

    }

    catch {

        showToast("❌ Unable to play audio.");

    }

});


// ======================================
// Random Word on Page Load
// ======================================

const randomWords = [

    "Integrity",
    "Algorithm",
    "Innovation",
    "Programming",
    "Computer",
    "Artificial",
    "Network",
    "Database",
    "Engineering",
    "Productivity"

];

function loadRandomWord() {

    const random =

        randomWords[
            Math.floor(
                Math.random() * randomWords.length
            )
        ];

    wordInput.value = random;

    searchWord();

}


// ======================================
// Search Using URL Parameter
// Example:
// dictionary.html?word=algorithm
// ======================================

const params = new URLSearchParams(

    window.location.search

);

const urlWord = params.get("word");

if (urlWord) {

    wordInput.value = urlWord;

    searchWord();

}

else {

    loadRandomWord();

}


// ======================================
// Initial Dashboard Update
// ======================================

updateDashboardWordCount();


// ======================================
// Dictionary Ready
// ======================================

console.log("📖 StudyMate Dictionary Loaded Successfully");