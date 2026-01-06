document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("input");
  const chat = document.getElementById("chat");
  const sendBtn = document.getElementById("sendBtn");

  // -------------------------------
  // Add message to chat
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
    return div;
  }

  // -------------------------------
  // Format AI markdown → HTML
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

    // User message
    addMessage(msg, "user");
    input.value = "";

    // Typing indicator
    const typingBubble = addMessage(
      `<div class="typing"><span></span><span></span><span></span></div>`,
      "bot",
      true
    );

    let res;
    try {
      res = await fetch("https://study-helper-ai-1.onrender.com/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg })
      });
    } catch (err) {
      typingBubble.remove();
      addMessage("❌ Cannot reach server", "bot");
      console.error(err);
      return;
    }

    const text = await res.text();
    typingBubble.remove();

    // -------------------------------
    // SAFETY: handle invalid responses
    // -------------------------------
    if (!text.startsWith("{")) {
      addMessage("❌ Server returned invalid response", "bot");
      console.error(text);
      return;
    }

    const data = JSON.parse(text);

    // ✅ THIS IS THE IMPORTANT FIX
    if (!data.choices || !data.choices[0]) {
      const errorMsg =
        data.error?.message ||
        "⚠️ AI did not return a valid response. Try again.";

      addMessage(errorMsg, "bot");
      console.error("API response:", data);
      return;
    }

    const reply = data.choices[0].message.content;
    addMessage(formatAI(reply), "bot", true);
  }

  // -------------------------------
  // Events
  // -------------------------------
  sendBtn.addEventListener("click", sendMessage);

  input.addEventListener("keydown", e => {
    if (e.key === "Enter") sendMessage();
  });

  input.focus();
});
