
const API_URL = "https://kerem-agent-api.kbayhan78.workers.dev";

const form = document.getElementById("chatForm");
const input = document.getElementById("prompt");
const messages = document.getElementById("messages");
const welcome = document.getElementById("welcome");
const statusLine = document.getElementById("status");

let history = [];
let chats = JSON.parse(localStorage.getItem("kerem_chats") || "[]");

function addMessage(content, role) {
  const el = document.createElement("div");
  el.className = "message " + role;
  el.textContent = content;
  messages.appendChild(el);
  el.scrollIntoView({ behavior: "smooth" });
}

function saveChats() {
  localStorage.setItem("kerem_chats", JSON.stringify(chats));
}

function saveCurrentChat() {
  if (!history.length) return;

  const chat = {
    id: Date.now(),
    title: history.find(m => m.role === "user")?.content.slice(0, 35) || "Yeni sohbet",
    messages: history
  };

  chats.unshift(chat);
  chats = chats.slice(0, 30);
  saveChats();
}

form.addEventListener("submit", async e => {
  e.preventDefault();

  const text = input.value.trim();
  if (!text) return;

  welcome.style.display = "none";

  addMessage(text, "user");
  history.push({ role: "user", content: text });

  input.value = "";
  statusLine.textContent = "KEREM AGENT düşünüyor...";

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: history })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Sunucu hatası");
    }

    if (!data.reply) {
      throw new Error("Yanıt alınamadı.");
    }

    history.push({
      role: "assistant",
      content: data.reply
    });

    addMessage(data.reply, "agent");
    saveCurrentChat();

    statusLine.textContent = "KEREM AGENT hazır";

  } catch (error) {
    addMessage("Hata: " + error.message, "agent");
    statusLine.textContent = "Bağlantı hatası";
  }
});

input.addEventListener("input", () => {
  input.style.height = "auto";
  input.style.height = Math.min(input.scrollHeight, 130) + "px";
});

document.querySelectorAll(".suggestion").forEach(button => {
  button.addEventListener("click", () => {
    input.value = button.textContent.trim();
    form.requestSubmit();
  });
});

document.getElementById("newChat").addEventListener("click", () => {
  history = [];
  messages.innerHTML = "";
  welcome.style.display = "block";
  statusLine.textContent = "Yeni sohbet hazır";
});

document.getElementById("menuBtn").addEventListener("click", () => {
  document.getElementById("sidebar").classList.toggle("open");
});

const memoryButton = document.getElementById("memoryButton");

if (memoryButton) {
  memoryButton.addEventListener("click", () => {
    const memory = localStorage.getItem("kerem_memory") || "";
    const updated = prompt("KEREM AGENT hafızası:", memory);

    if (updated !== null) {
      localStorage.setItem("kerem_memory", updated);
      alert("Hafıza kaydedildi!");
    }
  });
}

const mic = document.getElementById("micBtn");
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

if (mic && SpeechRecognition) {
  mic.addEventListener("click", () => {
    const recognition = new SpeechRecognition();
    recognition.lang = "tr-TR";

    recognition.onresult = e => {
      input.value = e.results[0][0].transcript;
    };

    recognition.start();
  });
}

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js").catch(() => {});
}
