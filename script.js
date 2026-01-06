document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("input");
  const chat = document.getElementById("chat");
  const sendBtn = document.getElementById("sendBtn");

  // -------------------------------
  // Proper AI formatter (REAL FIX)
  // -------------------------------
  function formatAI(text) {
    const lines = text.split("\n");
    let html = "";
    let inUL = false;
    let inOL = false;

    lines.forEach(line => {
      line = line.trim();

      // Numbered list
      if (/^\d+\.\s+/.test(line)) {
        if (!inOL) {
          html += "<ol>";
          inOL = true;
        }
        html += `<li>${line.replace(/^\d+\.\s+/, "")}</li>`;
        return;
      } else if (inOL) {
        html += "</ol>";
        inOL = false;
      }

      // Bullet list
      if (/^[-•]\s+/.test(line)) {
        if (!inUL) {
          html += "<ul>";
          inUL = true;
        }
        html += `<li>${line.replace(/^[-•]\s+/, "")}</li>`;
        return;
      } else if (inUL) {
        html += "</ul>";
        inUL = false;
      }

      // Bold & italic
      line = line
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.*?)\*/g, "<em>$1</em>");

      // Paragraph
      if (line !== "") {
        html += `<p>${line}</p>`;
      }
    });

    if (inUL) html += "</ul>";
    if (inOL) html += "</ol>";

    return html;
  }

  // -------------------------------
  // Add message
  // -------------------------------
  function addMessage(content, role, isHTML = false) {
    const div = document.createElement("div");
    div.className = `message ${role}`;
    isHTML ? (div.innerHTML = content) : (div.textContent = content);
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
    return div;
  }

  // -------------------------------
  // Send message
  // -------------------------------
  async function sendMessage() {
    const msg = input.value.trim();
    if (!msg) return;

    addMessage(msg, "user");
    input.value = "";

    const typing = addMessage("<em>AI is thinking…</em>", "bot", true);

    try {
      const res = await fetch("http://localhost:3001/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg })
      });

      const data = await res.json();
      typing.remove();

      addMessage(formatAI(data.reply), "bot", true);

    } catch (err) {
      typing.remove();
      addMessage("❌ Cannot reach server", "bot");
    }
  }

  sendBtn.addEventListener("click", sendMessage);
  input.addEventListener("keydown", e => {
    if (e.key === "Enter") sendMessage();
  });
});
