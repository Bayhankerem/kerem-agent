
const API_URL = "https://kerem-agent-api.kbayhan78.workers.dev";

const form = document.getElementById("chatForm");
const input = document.getElementById("prompt");
const messages = document.getElementById("messages");
const welcome = document.getElementById("welcome");
const statusLine = document.getElementById("status");

let history = [];

function addMessage(text, who) {
  const el = document.createElement("div");
  el.className = "message " + who;
  el.textContent = text;
  messages.appendChild(el);
  el.scrollIntoView({ behavior: "smooth", block: "end" });
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const text = input.value.trim();
  if (!text) return;

  welcome.style.display = "none";
  addMessage(text, "user");
  input.value = "";
  input.style.height = "auto";

  history.push({ role: "user", content: text });
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

    const reply = data.reply || "Yanıt alınamadı.";
    history.push({ role: "assistant", content: reply });
    addMessage(reply, "agent");
    statusLine.textContent = "KEREM AGENT hazır";
  } catch (error) {
    addMessage("Bağlantı hatası: " + error.message, "agent");
    statusLine.textContent = "Bağlantı kontrol edilmeli";
  }
});

input.addEventListener("input", () => {
  input.style.height = "auto";
  input.style.height = Math.min(input.scrollHeight, 130) + "px";
});

document.querySelectorAll(".suggestion").forEach(b =>
  b.addEventListener("click", () => {
    input.value = b.textContent.replace(/^.{1,3}/, "").trim();
    form.requestSubmit();
  })
);

document.getElementById("newChat").addEventListener("click", () => {
  messages.innerHTML = "";
  history = [];
  welcome.style.display = "block";
});

document.getElementById("menuBtn").addEventListener("click", () =>
  document.getElementById("sidebar").classList.toggle("open")
);

document.getElementById("memoryButton").addEventListener("click", () =>
  alert("Hafıza sistemi sonraki sürümde eklenecek.")
);

const mic = document.getElementById("micBtn");
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition) {
  mic.addEventListener("click", () => {
    const rec = new SpeechRecognition();
    rec.lang = "tr-TR";
    rec.interimResults = false;
    mic.classList.add("listening");
    statusLine.textContent = "Dinliyorum...";

    rec.onresult = e => {
      input.value = e.results[0][0].transcript;
    };

    rec.onerror = () => {
      statusLine.textContent = "Mikrofon kullanılamadı.";
    };

    rec.onend = () => {
      mic.classList.remove("listening");
      statusLine.textContent = "KEREM AGENT hazır";
    };

    rec.start();
  });
} else {
  mic.addEventListener("click", () =>
    alert("Ses tanıma bu tarayıcıda desteklenmiyor.")
  );
}

if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  navigator.serviceWorker.register("./sw.js").catch(() => {});
}
