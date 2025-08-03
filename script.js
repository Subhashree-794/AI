const chatBody = document.querySelector(".chat-body");
const messageInput = document.querySelector(".message-input");
const sendMessageButton = document.querySelector("#send-message");

// API setup - fix URL and key header usage
const API_KEY = process.env.API_KEY
const API_URL = process.env.API_URL


const userData = {
    message: null,
};

const createMessageElement = (content, ...classes) => {
    const div = document.createElement("div");
    div.classList.add("message", ...classes);
    div.innerHTML = content;
    return div;
};

// Generate bot response using API
const generateBotResponse = async (incomingMessageDiv) => {
    const messageElement = incomingMessageDiv.querySelector(".message-text");
    try {
        const requestOptions = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-goog-api-key": API_KEY,
                "Access-Control-Allow-Origin":true
            },
            body: JSON.stringify({
                prompt: {
                    messages: [{ author: "user", content: { text: userData.message } }]
                },
                temperature: 0.7,
                candidateCount: 1,
                maxOutputTokens: 256,
            }),
        };

        const response = await fetch(API_URL, requestOptions);
        console.log(response)
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error?.message || "API error");
        }
        const data = await response.json();

        // Defensive access to bot response text
        const apiResponseText =
            data.candidates?.[0]?.content?.text?.replace(/\*\*(.*?)\*\*/g, "$1").trim() ||
            "Sorry, no response from API.";

        messageElement.innerText = apiResponseText;
    } catch (error) {
        console.error(error.message);
        messageElement.innerText = "Error: " + error.message;
    } finally {
        incomingMessageDiv.classList.remove("thinking");
        chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
    }
};

const handleOutgoingMessage = (e) => {
    e.preventDefault();
    const trimmedMessage = messageInput.value.trim();
    if (!trimmedMessage) return;

    userData.message = trimmedMessage;
    messageInput.value = "";

    // Append user message
    const userMessageDiv = createMessageElement(
        `<div class="message-text">${userData.message}</div>`,
        "user-message"
    );
    chatBody.appendChild(userMessageDiv);
    chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });

    // Append bot thinking message placeholder
    const botMessageContent = `
    <svg class="bot-avatar" xmlns="http://www.w3.org/2000/svg" width="50" height="50"
      viewBox="0 0 1024 1024">
      <path
        d="M738.3 287.6H285.7c-59 0-106.8 47.8-106.8 106.8v303.1c0 59 47.8 106.8 106.8 106.8h81.5v111.1c0 .7.8 1.1 1.4.7l166.9-110.6 41.8-.8h117.4l43.6-.4c59 0 106.8-47.8 106.8-106.8V394.5c0-59-47.8-106.9-106.8-106.9zM351.7 448.2c0-29.5 23.9-53.5 53.5-53.5s53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5-53.5-23.9-53.5-53.5zm157.9 267.1c-67.8 0-123.8-47.5-132.3-109h264.6c-8.6 61.5-64.5 109-132.3 109zm110-213.7c-29.5 0-53.5-23.9-53.5-53.5s23.9-53.5 53.5-53.5 53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5zM867.2 644.5V453.1h26.5c19.4 0 35.1 15.7 35.1 35.1v121.1c0 19.4-15.7 35.1-35.1 35.1h-26.5zM95.2 609.4V488.2c0-19.4 15.7-35.1 35.1-35.1h26.5v191.3h-26.5c-19.4 0-35.1-15.7-35.1-35.1zM561.5 149.6c0 23.4-15.6 43.3-36.9 49.7v44.9h-30v-44.9c-21.4-6.5-36.9-26.3-36.9-49.7 0-28.6 23.3-51.9 51.9-51.9s51.9 23.3 51.9 51.9z"></path>
    </svg>
    <div class="message-text">
      <div class="thinking-indicator">
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
      </div>
    </div>`;
    const incomingMessageDiv = createMessageElement(botMessageContent, "bot-message", "thinking");
    chatBody.appendChild(incomingMessageDiv);
    chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });

    generateBotResponse(incomingMessageDiv);
};

messageInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleOutgoingMessage(e);
    }
});

sendMessageButton.addEventListener("click", (e) => {
    handleOutgoingMessage(e);
});
