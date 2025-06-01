# 💬 LeetCode Buddy – Your AI-Powered Coding Assistant

LeetCode Buddy is a lightweight and elegant Chrome extension that integrates an AI assistant directly into LeetCode's UI. It helps you solve problems more effectively by answering questions, giving hints, and analyzing your code using the Groq AI API.

<p align="center">
  <img src="https://github.com/sinster23/Screenshots/blob/main/leetcode-solver-ss/code-solver-ss1.png" alt="API Key Popup" width="45%" style="margin-right: 10px;" />
  <img src="https://github.com/sinster23/Screenshots/blob/main/leetcode-solver-ss/code-solver-ss2.png" alt="Chatbox on LeetCode" width="45%" />
</p>

<p align="center">
  <b>Left:</b> API Key Setup &nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp; <b>Right:</b> AI Chatbox on LeetCode
</p>


---

## 🚀 Features

- 🧠 Ask coding questions directly on any LeetCode problem page
- 🤖 AI understands your question **in the context** of the current problem and your code
- 💾 Chat history is saved between sessions
- 🔒 Secure API key storage using Chrome local storage
- 🎨 Sleek, draggable, and blur-styled chat UI
- ☁️ Powered by Groq’s blazing-fast LLMs

---

## 📦 Installation

1. Clone or download this repository.
2. Go to `chrome://extensions/` in your Chrome browser.
3. Enable **Developer Mode** (top right).
4. Click **Load Unpacked** and select the project folder.
5. Click on the extension icon and enter your **Groq API key** (starts with `gsk_`).
6. Done! Now go to a LeetCode problem and click **"Ask Buddy"**.

---

## 🧪 How It Works

- The extension injects a chatbox into LeetCode pages.
- When you ask a question, it:
  - Grabs the current problem description
  - Extracts your submitted code
  - Detects the selected language
  - Sends everything to Groq's LLM for a response

---

## 🛠️ Tech Stack

- JavaScript (Vanilla)
- Chrome Extensions APIs (`manifest v3`)
- HTML + CSS
- Groq API (for LLMs)

---

## 🔐 API Key Storage

Your API key is stored securely in **`chrome.storage.local`** and never leaves your browser.

You can delete the key anytime from the extension popup.

---

## 📣 Contribute / Support

If you like this tool, consider giving it a ⭐ and checking out my other work:

👉 [My GitHub Profile](https://github.com/sinster23)

---

## 📄 License

MIT License. Feel free to use, modify, or share!

---

