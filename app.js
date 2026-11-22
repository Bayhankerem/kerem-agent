
"use strict";

// KEREM AGENT - Uygulama 2.0

const API_URL = "https://kerem-agent-api.kbayhan78.workers.dev";

const $ = (id) => document.getElementById(id);

const form = $("chatForm");
const input = $("prompt");
const messagesBox = $("messages");
const welcome = $("welcome");
const statusLine = $("status");
const newChatButton = $("newChat");
const memoryButton = $("memoryButton");
const micButton = $("micBtn");

if (!form || !input || !messagesBox) {
  throw new Error("Gerekli HTML öğeleri bulunamadı.");
}

// Uygulama verileri
let history = [];
let chats = [];
let currentChatId = null;
let selectedImage = null;
let busy = false;

try {
  chats = JSON.parse(localStorage.getItem("kerem_chats") || "[]");
  if (!Array.isArray(chats)) chats = [];
} catch {
  chats = [];
}

function getMemory() {
  return localStorage.getItem("kerem_memory") || "";
}

function saveChats() {
  try {
    localStorage.setItem("kerem_chats", JSON.stringify(chats));
  } catch (error) {
    setStatus("Sohbet kaydedilemedi. Depolama alanı dolmuş olabilir.");
  }
}

function setStatus(text) {
  if (statusLine) statusLine.textContent = text;
}

// Sohbet oluşturma ve kaydetme
function ensureChat() {
  if (currentChatId) return;

  currentChatId = Date.now().toString();

  chats.unshift({
    id: currentChatId,
    title: "Yeni sohbet",
    messages: [],
    updatedAt: Date.now()
  });
}

function saveCurrentChat() {
  if (!history.length || !currentChatId) return;

  const chat = chats.find(c => c.id === currentChatId);
  if (!chat) return;

  chat.messages = history.map(m => ({
    role: m.role,
    content: m.content
  }));

  const firstUser = history.find(m => m.role === "user");

  if (firstUser) {
    chat.title = firstUser.content.slice(0, 35);
  }

  chat.updatedAt = Date.now();

  chats.sort((a, b) => b.updatedAt - a.updatedAt);
  chats = chats.slice(0, 30);

  saveChats();
  renderChatList();
}

// Mesaj gösterme
function addMessage(content, role, imageUrl = null) {
  const wrapper = document.createElement("div");
  wrapper.className = "message " + role;

  if (imageUrl) {
    const image = document.createElement("img");
    image.src = imageUrl;
    image.alt = "Gönderilen fotoğraf";
    image.style.maxWidth = "220px";
    image.style.maxHeight = "220px";
    image.style.display = "block";
    image.style.objectFit = "contain";
    image.style.borderRadius = "12px";
    image.style.marginBottom = "8px";
    wrapper.appendChild(image);
  }

  if (content) {
    const text = document.createElement("div");
    text.textContent = content;
    wrapper.appendChild(text);
  }

  messagesBox.appendChild(wrapper);
  wrapper.scrollIntoView({
    behavior: "smooth",
    block: "end"
  });

  return wrapper;
}

function clearScreen() {
  messagesBox.innerHTML = "";
  if (welcome) welcome.style.display = "block";
}

// Sohbet listesini oluştur
function renderChatList() {
  let area = $("chatHistory");

  if (!area) {
    area = document.createElement("div");
    area.id = "chatHistory";
    area.style.marginTop = "20px";

    const sidebar = $("sidebar");

    if (sidebar) {
      const bottom = sidebar.querySelector(".sidebar-bottom");
      sidebar.insertBefore(area, bottom || null);
    }
  }

  area.innerHTML = "";

  const heading = document.createElement("div");
  heading.textContent = "SOHBET GEÇMİŞİ";
  heading.className = "side-label";
  area.appendChild(heading);

  chats.forEach(chat => {
    const button = document.createElement("button");

    button.type = "button";
    button.className = "side-item";
    button.textContent = "◈  " + (chat.title || "Sohbet");

    button.style.width = "100%";
    button.style.textAlign = "left";
    button.style.overflow = "hidden";
    button.style.textOverflow = "ellipsis";

    if (chat.id === currentChatId) {
      button.classList.add("active");
    }

    button.addEventListener("click", () => {
      openChat(chat.id);
    });

    area.appendChild(button);
  });
}

function openChat(id) {
  const chat = chats.find(c => c.id === id);
  if (!chat) return;

  currentChatId = id;
  history = chat.messages.map(m => ({
    role: m.role,
    content: m.content
  }));

  clearScreen();

  if (history.length && welcome) {
    welcome.style.display = "none";
  }

  history.forEach(m => {
    addMessage(
      m.content,
      m.role === "assistant" ? "agent" : "user"
    );
  });

  setStatus("Kayıtlı sohbet açıldı.");
  renderChatList();

  $("sidebar")?.classList.remove("open");
}

function startNewChat() {
  history = [];
  currentChatId = null;
  selectedImage = null;

  clearScreen();
  updateImagePreview();

  setStatus("Yeni sohbet hazır.");
  renderChatList();
}

// Fotoğraf yükleme alanı
const imageInput = document.createElement("input");

imageInput.type = "file";
imageInput.accept = "image/png,image/jpeg,image/webp";
imageInput.hidden = true;

document.body.appendChild(imageInput);

const attachButton = document.createElement("button");

attachButton.type = "button";
attachButton.className = "icon-btn";
attachButton.textContent = "📎";
attachButton.title = "Fotoğraf ekle";
attachButton.setAttribute("aria-label", "Fotoğraf ekle");

micButton?.parentNode?.insertBefore(attachButton, micButton);

const preview = document.createElement("div");

preview.id = "imagePreview";
preview.style.display = "none";
preview.style.padding = "8px 12px";

const previewImage = document.createElement("img");

previewImage.style.maxWidth = "100px";
previewImage.style.maxHeight = "100px";
previewImage.style.borderRadius = "10px";
previewImage.style.objectFit = "contain";

const removeImageButton = document.createElement("button");

removeImageButton.type = "button";
removeImageButton.textContent = "✕";
removeImageButton.className = "icon-btn";
removeImageButton.title = "Fotoğrafı kaldır";

preview.append(previewImage, removeImageButton);

form.parentNode.insertBefore(preview, form);

function updateImagePreview() {
  if (!selectedImage) {
    preview.style.display = "none";
    previewImage.removeAttribute("src");
    return;
  }

  preview.style.display = "block";
  previewImage.src = selectedImage;
}

attachButton.addEventListener("click", () => {
  imageInput.click();
});

imageInput.addEventListener("change", () => {
  const file = imageInput.files?.[0];

  if (!file) return;

  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    setStatus("Lütfen JPG, PNG veya WEBP fotoğraf seç.");
    imageInput.value = "";
    return;
  }

  if (file.size > 3 * 1024 * 1024) {
    setStatus("Fotoğraf en fazla 3 MB olabilir.");
    imageInput.value = "";
    return;
  }

  const reader = new FileReader();

  reader.onload = () => {
    selectedImage = reader.result;
    updateImagePreview();
    setStatus("Fotoğraf eklendi. Gönderebilirsin.");
  };

  reader.onerror = () => {
    setStatus("Fotoğraf okunamadı.");
  };

  reader.readAsDataURL(file);
});

removeImageButton.addEventListener("click", () => {
  selectedImage = null;
  imageInput.value = "";
  updateImagePreview();
  setStatus("Fotoğraf kaldırıldı.");
});

// Mesaj gönderme
form.addEventListener("submit", async event => {
  event.preventDefault();

  if (busy) return;

  const text = input.value.trim();
  const image = selectedImage;

  if (!text && !image) return;

  busy = true;

  const sendButton = form.querySelector('[type="submit"]');
  if (sendButton) sendButton.disabled = true;

  const imageUrl = image;

  ensureChat();

  if (welcome) welcome.style.display = "none";

  addMessage(
    text || "Bu fotoğrafı incele.",
    "user",
    imageUrl
  );

  history.push({
    role: "user",
    content: text || "Bu fotoğrafı incele."
  });

  input.value = "";
  input.style.height = "auto";

  selectedImage = null;
  imageInput.value = "";
  updateImagePreview();

  setStatus("KEREM AGENT yanıt hazırlıyor...");

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messages: history.slice(-10),
        memory: getMemory(),
        image: image || null
      })
    });

    let data;

    try {
      data = await response.json();
    } catch {
      throw new Error("Sunucudan geçerli yanıt alınamadı.");
    }

    if (!response.ok) {
      throw new Error(data.error || "Sunucu hatası.");
    }

    if (typeof data.reply !== "string" || !data.reply.trim()) {
      throw new Error("Yapay zekâ boş yanıt verdi.");
    }

    history.push({
      role: "assistant",
      content: data.reply
    });

    addMessage(data.reply, "agent");

    saveCurrentChat();
    setStatus("KEREM AGENT hazır.");

  } catch (error) {
    // Başarısız mesajı tekrar denemek için geçmişten çıkar.
    history.pop();

    addMessage(
      "Bağlantı hatası: " + error.message,
      "agent"
    );

    setStatus("Bağlantı kurulamadı.");
  } finally {
    busy = false;

    if (sendButton) sendButton.disabled = false;
    input.focus();
  }
});

// Yazı alanını otomatik büyüt
input.addEventListener("input", () => {
  input.style.height = "auto";
  input.style.height =
    Math.min(input.scrollHeight, 130) + "px";
});

// Öneri düğmeleri
document.querySelectorAll(".suggestion").forEach(button => {
  button.addEventListener("click", () => {
    input.value = button.textContent
      .replace(/^[^\p{L}\p{N}]+/u, "")
      .trim();

    form.requestSubmit();
  });
});

// Yeni sohbet
newChatButton?.addEventListener("click", startNewChat);

// Hafıza yönetimi
memoryButton?.addEventListener("click", () => {
  const currentMemory = getMemory();

  const updated = window.prompt(
    "KEREM AGENT hafızası\n\nBuraya hatırlamasını istediğin bilgileri yaz:",
    currentMemory
  );

  if (updated === null) return;

  localStorage.setItem("kerem_memory", updated.trim());

  setStatus("Hafıza kaydedildi.");
  alert("Hafıza başarıyla kaydedildi.");
});

// Mobil menü
$("menuBtn")?.addEventListener("click", () => {
  $("sidebar")?.classList.toggle("open");
});

// Mikrofonla yazma
const SpeechRecognition =
  window.SpeechRecognition ||
  window.webkitSpeechRecognition;

if (micButton) {
  if (!SpeechRecognition) {
    micButton.title = "Tarayıcın sesle yazmayı desteklemiyor.";
  } else {
    micButton.addEventListener("click", () => {
      const recognition = new SpeechRecognition();

      recognition.lang = "tr-TR";
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setStatus("Seni dinliyorum...");
      };

      recognition.onresult = event => {
        const spokenText = event.results[0][0].transcript;

        input.value = (
          input.value + " " + spokenText
        ).trim();

        input.dispatchEvent(new Event("input"));
        setStatus("Ses yazıya çevrildi.");
      };

      recognition.onerror = () => {
        setStatus("Mikrofon kullanılamadı.");
      };

      recognition.onend = () => {
        if (!busy) setStatus("KEREM AGENT hazır.");
      };

      recognition.start();
    });
  }
}

// Başlangıç
renderChatList();
setStatus("KEREM AGENT bağlantıya hazır.");

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js").catch(error => {
    console.warn("Service Worker kaydedilemedi:", error);
  });
}
