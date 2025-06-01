const SYSTEM_PROMPT = `
You are LeetCode Buddy, a friendly and conversational AI helper for students solving LeetCode problems. Your goal is to guide students step-by-step toward a solution without giving the full answer immediately.

Input Context:

Problem Statement: {{problem_statement}}
User Code: {{user_code}}
Programming Language: {{programming_language}}

Your Tasks:

Analyze User Code:

- Spot mistakes or inefficiencies in {{user_code}}.
- Start with small feedback and ask friendly follow-up questions, like where the user needs help.
- Keep the conversation flowing naturally, like you're chatting with a friend. 😊

Provide Hints:

- Share concise, relevant hints based on {{problem_statement}}.
- Let the user lead the conversation—give hints only when necessary.
- Avoid overwhelming the user with too many hints at once.

Suggest Code Snippets:

- Share tiny, focused code snippets only when they’re needed to illustrate a point.

Output Requirements:

- Keep the feedback short, friendly, and easy to understand.
- Snippet should always be code only and is optional.
- Do not say hey every time.
- Keep making feedback more personal and short over time.
- Limit the words in feedback. Only give what is really required to the user as feedback.
- Hints must be crisp, short and clear.

Tone & Style:

- Be kind, supportive, and approachable.
- Use emojis like 🌟, 🙌, or ✅ to make the conversation fun and engaging.
- Avoid long, formal responses—be natural and conversational.

`;

chrome.storage.local.get("openai_api_key", res => console.log("🔑 Key:", res.openai_api_key));
chrome.storage.local.get("openai_api_key", (res) => {
  const key = res.openai_api_key;
  if (key) {
    insertAskAiButton();
  }
});

let messages = null; 

function addMessage(sender, text, save = true) {
  const bubble = document.createElement("div");
  bubble.textContent = text;
  bubble.style.cssText = `
    padding: 8px 12px;
    border-radius: 18px;
    max-width: 80%;
    font-size: 14px;
    line-height: 1.4;
    white-space: pre-wrap;
    word-break: break-word;
    background: ${sender === "user" ? "#ffffff" : "#3a3f4b"};
    color: ${sender === "user" ? "#000" : "#fff"};
    align-self: ${sender === "user" ? "flex-start" : "flex-end"};
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  `;
  messages.appendChild(bubble);
  messages.scrollTop = messages.scrollHeight;

  if (save) saveChatHistory();
}

function saveChatHistory() {
  const allMessages = [];
  for (const bubble of messages.children) {
    const isUser = bubble.style.backgroundColor === "rgb(255, 255, 255)";
    allMessages.push({ sender: isUser ? "user" : "ai", text: bubble.textContent });
  }
  chrome.storage.local.set({ leetcodeChatHistory: allMessages });
}


function makeDraggable(el) {
  let isDragging = false;
  let dragMoved = false;
  let offsetX = 0;
  let offsetY = 0;
  let startX = 0;
  let startY = 0;
  const dragThreshold = 5;

  el.style.position = "fixed";
  el.style.cursor = "pointer";

  el.addEventListener("mousedown", (e) => {
    isDragging = true;
    dragMoved = false;
    startX = e.clientX;
    startY = e.clientY;
    offsetX = e.clientX - el.getBoundingClientRect().left;
    offsetY = e.clientY - el.getBoundingClientRect().top;
    el.style.cursor = "move";
    el.style.transition = "none";
  });

  document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;

    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    if (Math.abs(dx) > dragThreshold || Math.abs(dy) > dragThreshold) {
      dragMoved = true;
    }

    if (dragMoved) {
      el.style.left = `${e.clientX - offsetX}px`;
      el.style.top = `${e.clientY - offsetY}px`;
      el.style.right = "auto";
      el.style.bottom = "auto";
    }
  });

  document.addEventListener("mouseup", () => {
    if (isDragging) {
      isDragging = false;
      el.style.cursor = "pointer";
      el.style.transition = "";
    }
  });

  el.addEventListener("click", (e) => {
    if (dragMoved) {
      e.stopImmediatePropagation();
      e.preventDefault();
      return;
    }
    createChatbox();
  });
}


function insertAskAiButton() {
  if (document.getElementById("leetcode-ask-ai-btn")) return;

  const btn = document.createElement("button");
  btn.id = "leetcode-ask-ai-btn";
  btn.textContent = "Ask Buddy";
  btn.style.cssText = `
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    background: linear-gradient(135deg, #0f0f11, #1a237e);
    color: #9ca5b4;
    border: none;
    padding: 10px 16px;
    border-radius: 8px;
    z-index: 9999;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 6px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    cursor: pointer;
  `;

  const icon = document.createElement("img");
  icon.src = chrome.runtime.getURL("icon.png"); 
  icon.style.width = "20px";
  icon.style.height = "20px";

  btn.prepend(icon);
  document.body.appendChild(btn);
  makeDraggable(btn);
  btn.addEventListener("click", () => {
  createChatbox();
});
}


async function askAI(message, context, userCode = "",  programmingLanguage = "Unknown") {
  const apiKey = await getApiKey();
  if (!apiKey) return "❌ No API key found. Please set it in the extension popup.";

  const problemStatement = context || "Unknown problem statement";

  let systemPrompt = SYSTEM_PROMPT
    .replace(/{{problem_statement}}/g, problemStatement)
    .replace(/{{programming_language}}/g, programmingLanguage)
    .replace(/{{user_code}}/g, userCode);

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        temperature: 0.7,
      }),
    });

    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() || "⚠️ No response from AI.";
  } catch (err) {
    console.error("AI error:", err);
    return "⚠️ Failed to connect to Groq API.";
  }
}


function extractProblemDescriptionFromDOM() {
  const descriptionContainer = document.querySelector('[data-track-load="description_content"]');
  if (!descriptionContainer) return null;

  return descriptionContainer.innerText.trim();
}

function getProblemContextFromDOM() {
  const titleEl = document.querySelector('.text-title-large a');
  const title = titleEl?.textContent?.trim() || "Unknown Title";

  const description = extractProblemDescriptionFromDOM() || "No description available.";

  return `Title: ${title}\n\n${description}`;
}

function getUserSolutionCode() {
  const editor = document.querySelector(".monaco-editor"); 
  if (!editor) return "";

  const lines = editor.querySelectorAll(".view-line");
  if (lines.length === 0) return "";

  return Array.from(lines).map(line => line.textContent).join("\n");
}

function getSelectedLanguage() {
  const langButton = document.querySelector('button[aria-haspopup="dialog"][aria-expanded][aria-controls]');
  if (!langButton) return "Unknown";

  return langButton.textContent.trim();
}


function getApiKey() {
  return new Promise((resolve) => {
    chrome.storage.local.get("openai_api_key", (result) => {
      resolve(result.openai_api_key || null);
    });
  });
}


async function createChatbox() {
  if (document.getElementById("leetcode-ai-chatbox")) return;

  const container = document.createElement("div");
  container.id = "leetcode-ai-chatbox";
  container.style.cssText = `
    position: fixed;
    bottom: 80px;
    right: 20px;
    width: 320px;
    max-height: 400px;
    background: rgba(30, 30, 30, 0.5);
    backdrop-filter: blur(6px);
    border-radius: 12px;
    box-shadow: 0 8px 16px rgba(0,0,0,0.4);
    z-index: 9999;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    font-family: 'Segoe UI', sans-serif;
  `;

  container.innerHTML = `
    <div id="chatbox-header" style="background:#2b2b2bcc; padding:10px; display:flex; justify-content:space-between; align-items:center; color:white; cursor:move;">
      <span>💬 LeetCode Buddy</span>
      <div>
        <button id="clear-chat" style="background:none; border:none; color:#f88; font-size:14px; cursor:pointer; margin-right:10px;">Clear</button>
        <button id="chatbox-close" style="background:none; border:none; color:#fff; font-size:18px; cursor:pointer;">×</button>
      </div>
    </div>
    <div id="chat-messages" style="flex:1; padding:10px; overflow-y:auto; display:flex; flex-direction:column; gap:6px; scrollbar-width: none;"></div>
    <div style="padding:10px; border-top:1px solid #444; display:flex; gap:8px;">
      <input id="chat-input" type="text" autocomplete="off" placeholder="Ask something..." style="flex:1; padding:8px; border:none; border-radius:6px; font-size:14px; background:#333; color:#fff; outline:none;" />
      <button id="send-btn" style="background:none; border:none; color:#fff; cursor:pointer; font-size:20px; padding:0 8px; display:flex; align-items:center;">➤</button>
    </div>
  `;

  document.body.appendChild(container);

  // Enable smooth drag movement
  const header = container.querySelector("#chatbox-header");
 if (header) {
  let isDragging = false;
  let offsetX = 0, offsetY = 0;

  header.addEventListener("mousedown", (e) => {
    isDragging = true;
    header.style.cursor = "move"; // Show move cursor while dragging
    offsetX = e.clientX - container.offsetLeft;
    offsetY = e.clientY - container.offsetTop;
    document.body.style.userSelect = "none";
  });

  document.addEventListener("mousemove", (e) => {
    if (isDragging) {
      container.style.left = `${e.clientX - offsetX}px`;
      container.style.top = `${e.clientY - offsetY}px`;
      container.style.right = "auto";
      container.style.bottom = "auto";
      container.style.position = "fixed";
    }
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
    header.style.cursor = "default"; 
    document.body.style.userSelect = "";
  });

  header.addEventListener("mouseenter", () => {
    if (!isDragging) header.style.cursor = "default"; 
  });
}


  // Style scroll behavior
  const style = document.createElement("style");
  style.textContent = `
    #chat-messages::-webkit-scrollbar { display: none; }
    #chat-messages { -ms-overflow-style: none; scrollbar-width: none; }
  `;
  document.head.appendChild(style);

  // Elements
  const input = document.getElementById("chat-input");
  messages = document.getElementById("chat-messages");
  const sendBtn = document.getElementById("send-btn");

  // Load history
  chrome.storage.local.get(["leetcodeChatHistory"], (result) => {
    (result.leetcodeChatHistory || []).forEach(({ sender, text }) => {
      addMessage(sender, text, false);
    });
    messages.scrollTop = messages.scrollHeight;
  });

  // Clear + close
 document.getElementById("clear-chat").onclick = async () => {
  try {
    messages.innerHTML = "";
    await new Promise((resolve) =>
      chrome.storage?.local?.remove("leetcodeChatHistory", resolve)
    );
    console.log("🗑️ Chat history cleared");
  } catch (err) {
    console.warn("Failed to clear storage:", err);
  }
};
  document.getElementById("chatbox-close").onclick = () => container.remove();

  // Message sending
  function handleSend() {
    const msg = input.value.trim();
    if (!msg) return;
    addMessage("user", msg);
    input.value = "";

    const context = getProblemContextFromDOM();
    const userCode = getUserSolutionCode();
    const programmingLanguage = getSelectedLanguage();

    askAI(msg, context, userCode, programmingLanguage).then(reply => {
      addMessage("ai", reply);
    });
  }

  sendBtn.addEventListener("click", handleSend);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleSend();
  });
}






