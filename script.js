document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("input");
  const chat = document.getElementById("chat");
  const sendBtn = document.getElementById("sendBtn");
  const exportBtn = document.getElementById("exportBtn");

  // -------------------------------
  // Message renderer
  // -------------------------------
  function addMessage(content, role, isHTML = false) {
    const div = document.createElement("div");
    div.className = `message ${role}`;

    if (isHTML) {
      div.innerHTML = content;
    } else {
      div.textContent = content;
    }

    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;

    // render math after adding content
    renderMathInElement(div, {
      delimiters: [
        { left: "$$", right: "$$", display: true },
        { left: "$", right: "$", display: false }
      ]
    });

    return div;
  }

  // -------------------------------
  // Format AI text → HTML
  // -------------------------------
  function formatAI(text) {
    return text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/^\d+\.\s/gm, match => `<br>${match}`)
      .replace(/\n/g, "<br>");
  }

  // -------------------------------
  // Send message
  // -------------------------------
  async function sendMessage() {
    const msg = input.value.trim();
    if (!msg) return;

    addMessage(msg, "user");
    input.value = "";

    const typingBubble = addMessage(
      `<div class="typing"><span></span><span></span><span></span></div>`,
      "bot",
      true
    );

    let res;
    try {
      res = await fetch("http://localhost:3000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg })
      });
    } catch (err) {
      typingBubble.remove();
      addMessage("❌ Cannot reach server", "bot");
      return;
    }

    const text = await res.text();
    typingBubble.remove();

    if (!text.startsWith("{")) {
      addMessage("❌ Invalid server response", "bot");
      return;
    }

    const data = JSON.parse(text);
    const reply = data.choices[0].message.content;

    addMessage(formatAI(reply), "bot", true);
  }

  // -------------------------------
  // EXPORT NOTES (Markdown)
  // -------------------------------
  function exportNotes() {
    let notes = "# Study Helper AI Notes\n\n";

    document.querySelectorAll(".message.bot").forEach((msg, i) => {
      const text = msg.innerText.trim();
      if (text) {
        notes += `## Answer ${i + 1}\n${text}\n\n`;
      }
    });

    const blob = new Blob([notes], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "study-notes.md";
    a.click();

    URL.revokeObjectURL(url);
  }

  // -------------------------------
  // Events
  // -------------------------------
  sendBtn.addEventListener("click", sendMessage);
  input.addEventListener("keydown", e => {
    if (e.key === "Enter") sendMessage();
  });

  exportBtn.addEventListener("click", exportNotes);

  input.focus();
});
