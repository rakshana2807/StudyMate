// ======================================
// DOM Elements
// ======================================

const loginTab = document.getElementById("loginTab");
const signupTab = document.getElementById("signupTab");
const showSignup = document.getElementById("showSignup");
const showLogin = document.getElementById("showLogin");

const authCard = document.getElementById("authCard");
const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");

const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const rememberMe = document.getElementById("rememberMe");
const loginBtn = document.getElementById("loginBtn");

const fullName = document.getElementById("fullName");
const username = document.getElementById("username");
const signupEmail = document.getElementById("signupEmail");
const signupPassword = document.getElementById("signupPassword");
const confirmPassword = document.getElementById("confirmPassword");
const signupBtn = document.getElementById("signupBtn");

const forgotPasswordBtn = document.getElementById("forgotPasswordBtn");
const passwordToggles = document.querySelectorAll(".password-toggle");
const strengthFill = document.getElementById("strengthFill");
const strengthText = document.getElementById("strengthText");
const typingText = document.getElementById("typingText");
const toast = document.getElementById("toast");

const loginEmailError = document.getElementById("loginEmailError");
const loginPasswordError = document.getElementById("loginPasswordError");
const fullNameError = document.getElementById("fullNameError");
const usernameError = document.getElementById("usernameError");
const signupEmailError = document.getElementById("signupEmailError");
const signupPasswordError = document.getElementById("signupPasswordError");
const confirmPasswordError = document.getElementById("confirmPasswordError");

const inputBoxes = document.querySelectorAll(".input-box");

// ======================================
// Local Storage
// ======================================

const defaultProfilePicture = "profile.jpg";
const projectDashboardPage =
    "file:///C:/Users/Admin/OneDrive/Desktop/studymate/pages/dashboard/index.html";

const projectProfilePicture =
    "file:///C:/Users/Admin/OneDrive/Desktop/studymate/pages/dashboard/profile.jpg";

let users =
    JSON.parse(localStorage.getItem("studyMateUsers")) || [];

let currentUser =
    JSON.parse(localStorage.getItem("studyMateCurrentUser")) || null;

let rememberedUser =
    JSON.parse(localStorage.getItem("studyMateRememberedUser")) || null;

// ======================================
// Login
// ======================================

function loginUser(event) {

    event.preventDefault();

    clearErrors();

    const email =
        loginEmail.value.trim().toLowerCase();

    const password =
        loginPassword.value;

    if (!validateLogin(email, password)) {

        shakeCard();
        return;

    }

    const user =
        users.find(item =>
            item.email === email &&
            item.password === password
        );

    if (!user) {

        loginPasswordError.textContent =
            "Incorrect email or password.";

        markInput(loginPassword, false);
        shakeCard();
        return;

    }

    user.loginTime =
        new Date().toLocaleString("en-IN");

    currentUser = {
        name: user.name,
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture,
        loginTime: user.loginTime,
        accountCreated: user.accountCreated
    };

    localStorage.setItem(
        "studyMateUsers",
        JSON.stringify(users)
    );

    localStorage.setItem(
        "studyMateCurrentUser",
        JSON.stringify(currentUser)
    );

    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("profileUsername", currentUser.username);
    localStorage.setItem("profileEmail", currentUser.email);
    localStorage.setItem("profileImage", currentUser.profilePicture);

    handleRememberMe(currentUser);

    showLoading(loginBtn, "Logging in");

    setTimeout(() => {

        showToast("Login successful");
        window.location.href = getDashboardPage();

    }, 900);

}

// ======================================
// Register
// ======================================

function registerUser(event) {

    event.preventDefault();

    clearErrors();

    const newUser = {
        name: fullName.value.trim(),
        username: username.value.trim(),
        email: signupEmail.value.trim().toLowerCase(),
        password: signupPassword.value,
        confirmPassword: confirmPassword.value,
        profilePicture: defaultProfilePicture,
        loginTime: "",
        accountCreated: new Date().toLocaleString("en-IN")
    };

    if (!validateRegister(newUser)) {

        shakeCard();
        return;

    }

    users.push({
        name: newUser.name,
        username: newUser.username,
        email: newUser.email,
        password: newUser.password,
        profilePicture: newUser.profilePicture,
        loginTime: newUser.loginTime,
        accountCreated: newUser.accountCreated
    });

    localStorage.setItem(
        "studyMateUsers",
        JSON.stringify(users)
    );

    showLoading(signupBtn, "Creating");

    setTimeout(() => {

        signupForm.reset();
        updatePasswordStrength("");
        clearInputStates();
        showToast("Account created successfully");
        switchForm("login");

        signupBtn.classList.remove("loading");
        signupBtn.innerHTML =
            '<span>Create Account</span><i class="fa-solid fa-user-plus"></i>';

        loginEmail.value = newUser.email;
        loginPassword.focus();

    }, 900);

}

// ======================================
// Validation
// ======================================

function validateLogin(email, password) {

    let isValid = true;

    if (email === "") {

        loginEmailError.textContent =
            "Email is required.";

        markInput(loginEmail, false);
        isValid = false;

    }

    else if (!isValidEmail(email)) {

        loginEmailError.textContent =
            "Enter a valid email.";

        markInput(loginEmail, false);
        isValid = false;

    }

    else {

        markInput(loginEmail, true);

    }

    if (password === "") {

        loginPasswordError.textContent =
            "Password is required.";

        markInput(loginPassword, false);
        isValid = false;

    }

    else {

        markInput(loginPassword, true);

    }

    return isValid;

}

function validateRegister(user) {

    let isValid = true;

    if (user.name === "") {

        fullNameError.textContent =
            "Full name is required.";

        markInput(fullName, false);
        isValid = false;

    }

    else {

        markInput(fullName, true);

    }

    if (user.username === "") {

        usernameError.textContent =
            "Username is required.";

        markInput(username, false);
        isValid = false;

    }

    else if (users.some(item =>
        item.username.toLowerCase() ===
        user.username.toLowerCase()
    )) {

        usernameError.textContent =
            "Username already exists.";

        markInput(username, false);
        isValid = false;

    }

    else {

        markInput(username, true);

    }

    if (user.email === "") {

        signupEmailError.textContent =
            "Email is required.";

        markInput(signupEmail, false);
        isValid = false;

    }

    else if (!isValidEmail(user.email)) {

        signupEmailError.textContent =
            "Enter a valid email.";

        markInput(signupEmail, false);
        isValid = false;

    }

    else if (users.some(item =>
        item.email === user.email
    )) {

        signupEmailError.textContent =
            "Email already exists.";

        markInput(signupEmail, false);
        isValid = false;

    }

    else {

        markInput(signupEmail, true);

    }

    const passwordError =
        getPasswordError(user.password);

    if (passwordError !== "") {

        signupPasswordError.textContent =
            passwordError;

        markInput(signupPassword, false);
        isValid = false;

    }

    else {

        markInput(signupPassword, true);

    }

    if (user.confirmPassword === "") {

        confirmPasswordError.textContent =
            "Confirm your password.";

        markInput(confirmPassword, false);
        isValid = false;

    }

    else if (user.password !== user.confirmPassword) {

        confirmPasswordError.textContent =
            "Passwords do not match.";

        markInput(confirmPassword, false);
        isValid = false;

    }

    else {

        markInput(confirmPassword, true);

    }

    return isValid;

}

function validateLiveField(input) {

    const value =
        input.value.trim();

    if (input === loginEmail) {

        loginEmailError.textContent =
            value === "" || isValidEmail(value)
                ? ""
                : "Enter a valid email.";

        if (value !== "") markInput(input, isValidEmail(value));

    }

    if (input === signupEmail) {

        const email =
            value.toLowerCase();

        const exists =
            users.some(user => user.email === email);

        signupEmailError.textContent =
            value === ""
                ? ""
                : !isValidEmail(email)
                    ? "Enter a valid email."
                    : exists
                        ? "Email already exists."
                        : "";

        if (value !== "") markInput(input, isValidEmail(email) && !exists);

    }

    if (input === username) {

        const exists =
            users.some(user =>
                user.username.toLowerCase() ===
                value.toLowerCase()
            );

        usernameError.textContent =
            value !== "" && exists
                ? "Username already exists."
                : "";

        if (value !== "") markInput(input, !exists);

    }

    if (input === signupPassword) {

        updatePasswordStrength(input.value);

        const error =
            input.value === ""
                ? ""
                : getPasswordError(input.value);

        signupPasswordError.textContent = error;

        if (input.value !== "") markInput(input, error === "");

        if (confirmPassword.value !== "") {
            validateLiveField(confirmPassword);
        }

    }

    if (input === confirmPassword) {

        const matches =
            input.value === signupPassword.value;

        confirmPasswordError.textContent =
            input.value === "" || matches
                ? ""
                : "Passwords do not match.";

        if (input.value !== "") markInput(input, matches);

    }

    if (input === fullName && value !== "") {

        markInput(input, true);

    }

    if (input === loginPassword && input.value !== "") {

        markInput(input, true);

    }

}

function isValidEmail(email) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

}

function getPasswordError(password) {

    if (password.length < 8) return "Password must be at least 8 characters.";
    if (!/[A-Z]/.test(password)) return "Add at least one uppercase letter.";
    if (!/[a-z]/.test(password)) return "Add at least one lowercase letter.";
    if (!/[0-9]/.test(password)) return "Add at least one number.";
    if (!/[^A-Za-z0-9]/.test(password)) return "Add at least one special character.";

    return "";

}

function clearErrors() {

    [
        loginEmailError,
        loginPasswordError,
        fullNameError,
        usernameError,
        signupEmailError,
        signupPasswordError,
        confirmPasswordError
    ].forEach(error => {

        error.textContent = "";

    });

}

function markInput(input, isValid) {

    const inputBox =
        input.closest(".input-box");

    if (!inputBox) return;

    inputBox.classList.toggle("valid", isValid);
    inputBox.classList.toggle("invalid", !isValid);

}

function clearInputStates() {

    inputBoxes.forEach(box => {

        box.classList.remove("valid", "invalid");

    });

}

// ======================================
// Remember Me
// ======================================

function handleRememberMe(user) {

    if (rememberMe.checked) {

        localStorage.setItem(
            "studyMateRememberedUser",
            JSON.stringify(user)
        );

    }

    else {

        localStorage.removeItem("studyMateRememberedUser");

    }

}

function autoLogin() {

    const loggedIn =
        localStorage.getItem("isLoggedIn") === "true";

    if (rememberedUser && loggedIn) {

        showToast("Welcome back, " + rememberedUser.username);

        setTimeout(() => {

            window.location.href = getDashboardPage();

        }, 900);

    }

}

// ======================================
// Forgot Password
// ======================================

function forgotPassword() {

    const email =
        prompt("Enter your registered email:");

    if (email === null) return;

    const cleanEmail =
        email.trim().toLowerCase();

    const userExists =
        users.some(user => user.email === cleanEmail);

    if (userExists) {

        showToast("Password reset link sent");

    }

    else {

        showToast("Email not found");

    }

}

// ======================================
// Logout
// ======================================

function logoutUser() {

    localStorage.removeItem("studyMateCurrentUser");
    localStorage.setItem("isLoggedIn", "false");
    window.location.href = "login.html";

}

function protectDashboard() {

    const isLoginPage =
        window.location.pathname
            .toLowerCase()
            .includes("login.html");

    const loggedIn =
        localStorage.getItem("isLoggedIn") === "true";

    if (!isLoginPage && !loggedIn) {

        window.location.href = "login.html";

    }

}

window.logoutUser = logoutUser;
window.protectDashboard = protectDashboard;

// ======================================
// Toast
// ======================================

function showToast(message) {

    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {

        toast.classList.remove("show");

    }, 2200);

}

// ======================================
// Helpers
// ======================================

function switchForm(type) {

    const showSignupForm =
        type === "signup";

    loginForm.classList.toggle("active-form", !showSignupForm);
    signupForm.classList.toggle("active-form", showSignupForm);
    loginTab.classList.toggle("active", !showSignupForm);
    signupTab.classList.toggle("active", showSignupForm);

    clearErrors();
    clearInputStates();

}

function togglePassword(button) {

    const input =
        document.getElementById(button.dataset.target);

    const icon =
        button.querySelector("i");

    const isPassword =
        input.type === "password";

    input.type =
        isPassword ? "text" : "password";

    icon.className =
        isPassword
            ? "fa-solid fa-eye-slash"
            : "fa-solid fa-eye";

}

function updatePasswordStrength(password) {

    let score = 0;

    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    const width =
        (score / 5) * 100;

    strengthFill.style.width =
        width + "%";

    if (password === "") {

        strengthText.textContent =
            "Password strength";

        strengthFill.style.width = "0%";
        return;

    }

    if (score <= 2) {

        strengthFill.style.background =
            "#E53935";

        strengthText.textContent =
            "Weak password";

    }

    else if (score <= 4) {

        strengthFill.style.background =
            "#fb8c00";

        strengthText.textContent =
            "Medium password";

    }

    else {

        strengthFill.style.background =
            "#28a745";

        strengthText.textContent =
            "Strong password";

    }

}

function showLoading(button, text) {

    button.classList.add("loading");

    button.innerHTML =
        `<span>${text}</span><i class="fa-solid fa-spinner"></i>`;

}

function shakeCard() {

    authCard.classList.remove("shake");

    setTimeout(() => {

        authCard.classList.add("shake");

    }, 10);

}

function startTypingEffect() {

    const text =
        "Welcome back, learner.";

    let index = 0;

    typingText.textContent = "";

    const interval =
        setInterval(() => {

            typingText.textContent +=
                text.charAt(index);

            index++;

            if (index >= text.length) {

                clearInterval(interval);

            }

        }, 55);

}

function loadSavedTheme() {

    const savedTheme =
        localStorage.getItem("theme") || "light";

    if (savedTheme === "dark") {

        document.documentElement.setAttribute("data-theme", "dark");

    }

}

function fixMissingProfileImage() {

    document.querySelectorAll("img").forEach(image => {

        image.addEventListener("error", () => {

            if (image.src !== projectProfilePicture) {

                image.src = projectProfilePicture;

            }

            else {

                image.style.display = "none";

            }

        });

    });

}

function getDashboardPage() {

    const isOutputPreview =
        window.location.href.includes("/outputs/");

    if (isOutputPreview) {

        return projectDashboardPage;

    }

    return "index.html";

}

// ======================================
// Initial Load
// ======================================

loadSavedTheme();
fixMissingProfileImage();
startTypingEffect();
autoLogin();

loginForm.addEventListener("submit", loginUser);
signupForm.addEventListener("submit", registerUser);
forgotPasswordBtn.addEventListener("click", forgotPassword);

loginTab.addEventListener("click", () => switchForm("login"));
signupTab.addEventListener("click", () => switchForm("signup"));
showSignup.addEventListener("click", () => switchForm("signup"));
showLogin.addEventListener("click", () => switchForm("login"));

[
    loginEmail,
    loginPassword,
    fullName,
    username,
    signupEmail,
    signupPassword,
    confirmPassword
].forEach(input => {

    input.addEventListener("input", () => {

        validateLiveField(input);

    });

});

passwordToggles.forEach(button => {

    button.addEventListener("click", () => togglePassword(button));

});

console.log("StudyMate Login Loaded Successfully");
