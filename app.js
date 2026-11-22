// Kerem Agent - Cloudflare API Bağlantılı Arayüz Yöneticisi (V 1.2)

const STORAGE_KEY = "kerem_agent_sessions_v1";
const CLOUDFLARE_API_URL = "https://SENIN-WORKER-ADRESIN.workers.dev"; // Burayı kendi Cloudflare URL'inle güncelle

const QUICK_PROMPTS = [
  {
    title: "Çalışma Planı Hazırla",
    prompt: "Bugün için odaklanmam gereken konuları ve kısa bir çalışma planı çıkar."
  },
  {
    title: "Teknik Konuyu Özetle",
    prompt: "Karmaşık bir teknik konuyu maddeler halinde ve net örneklerle özetle."
  },
  {
    title: "Kod / Mantık İncele",
    prompt: "Yazdığım kodu veya mantık kurgusunu hatalar ve iyileştirmeler açısından değerlendir."
  }
];

const state = {
  sessions: [],
  activeSessionId: null,
  isGenerating: false,
  aiEndpoint: CLOUDFLARE_API_URL.trim()
};

const dom = {
  main: document.querySelector("main"),
  section: document.querySelector("main section"),
  aside: document.querySelector("aside"),
  statusText: document.querySelector("aside span")?.parentElement || null,
  liveRegion: document.querySelector('[aria-live="polite"]')
};

function isEndpointConfigured() {
  return Boolean(state.aiEndpoint && !state.aiEndpoint.includes("SENIN-WORKER-ADRESIN"));
}

function createId() {
  return "s_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 7);
}

function loadSessions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveSessions() {
  try {
    localStorage.setItem(STORAGE_
