// --- CONFIGURATION ---
const API_KEY = "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"; // Replace with your actual key
const API_URL = "https://api.openai.com/v1/chat/completions";

let currentUser = null;

// --- AUTH LOGIC ---
function toggleAuth() {
    document.getElementById('login-form').classList.toggle('hidden');
    document.getElementById('signup-form').classList.toggle('hidden');
}

function signup() {
    const name = document.getElementById('signup-name').value;
    const user = document.getElementById('signup-user').value;
    if(!name || !user) return alert("Fill all fields");

    const accounts = JSON.parse(localStorage.getItem('actora_accounts') || "{}");
    if(accounts[user]) return alert("Username taken");

    accounts[user] = { name: name, history: [] };
    localStorage.setItem('actora_accounts', JSON.stringify(accounts));
    alert("Account created! Please login.");
    toggleAuth();
}

function login() {
    const user = document.getElementById('login-user').value;
    const accounts = JSON.parse(localStorage.getItem('actora_accounts') || "{}");

    if(accounts[user]) {
        currentUser = { username: user, ...accounts[user] };
        loadChat();
    } else {
        alert("User not found!");
    }
}

// --- CHAT LOGIC ---
function loadChat() {
    document.getElementById('auth-container').classList.add('hidden');
    document.getElementById('chat-container').classList.remove('hidden');
    document.getElementById('welcome-msg').innerText = `Welcome, ${currentUser.name}`;
    
    // Render stored history
    const chatWindow = document.getElementById('chat-window');
    chatWindow.innerHTML = '';
    currentUser.history.forEach(msg => addMessageToUI(msg.role, msg.content));
}

function addMessageToUI(role, text) {
    const win = document.getElementById('chat-window');
    const div = document.createElement('div');
    div.className = `message ${role === 'user' ? 'user-msg' : 'ai-msg'}`;
    div.innerText = text;
    win.appendChild(div);
    win.scrollTop = win.scrollHeight;
}

async function sendMessage() {
    const input = document.getElementById('user-input');
    const text = input.value.trim();
    if(!text) return;

    addMessageToUI('user', text);
    input.value = '';

    // Connect to API
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo", // or gpt-4
                messages: [{ role: "user", content: text }]
            })
        });

        const data = await response.json();
        const aiResponse = data.choices[0].message.content;
        
        addMessageToUI('assistant', aiResponse);
        saveToHistory(text, aiResponse);
        
    } catch (err) {
        addMessageToUI('assistant', "Error: Check your API key or connection.");
    }
}

function saveToHistory(userText, aiText) {
    const accounts = JSON.parse(localStorage.getItem('actora_accounts'));
    accounts[currentUser.username].history.push({ role: 'user', content: userText });
    accounts[currentUser.username].history.push({ role: 'assistant', content: aiText });
    localStorage.setItem('actora_accounts', JSON.stringify(accounts));
}

function logout() {
    location.reload();
}