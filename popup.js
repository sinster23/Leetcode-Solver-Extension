document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector(".container");

  chrome.storage.local.get("openai_api_key", (result) => {
    const apiKey = result.openai_api_key;

    if (apiKey) {
      renderInfoUI(container); // overwrite only if needed
    } else {
      attachSaveHandler(); // just attach to existing DOM
    }
  });
});

function attachSaveHandler() {
  const saveBtn = document.getElementById("saveBtn");
  const input = document.getElementById("apiKey");
  const status = document.getElementById("status");

  saveBtn?.addEventListener("click", () => {
    const key = input.value.trim();

    if (!key.startsWith("gsk_")) {
      status.innerText = "Please enter a valid API key.";
      status.style.color = "red";
      return;
    }

    chrome.storage.local.set({ openai_api_key: key }, () => {
      status.innerText = "Settings Saved Successfully!";
      status.style.color = "green";
      setTimeout(() => window.close(), 1000);
    });
  });
}

function renderInfoUI(container) {
  container.innerHTML = `
  <div class="header">
    <img src="icon.png" alt="Leetcode Buddy Icon" style="width: 25px; height: 25px;">
    <h1>Leetcode Buddy</h1>
  </div>
  <p style="font-weight: bold;">Your API key is saved !!</p>
  <button id="deleteKeyBtn" class="danger-btn">Delete API Key</button>
  <p>
    Thanks for using my product. View and support my works on my  
    <a href="https://github.com/sinster23" target="_blank">GitHub</a> page
  </p>
`;

 const style = document.createElement("style");
style.textContent = `
  .danger-btn {
    background-color: red;
    color: white;
    padding: 10px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    margin-bottom: 20px;
    transition: background-color 0.3s ease;
  }

  .danger-btn:hover {
    background-color: #c62828; /* Darker red */
  }
`;
document.head.appendChild(style);

  document.head.appendChild(style);

  document.getElementById("deleteKeyBtn").addEventListener("click", () => {
    chrome.storage.local.remove("openai_api_key", () => {
      // Refresh to show the API input form again
      location.reload();
    });
  });
}
