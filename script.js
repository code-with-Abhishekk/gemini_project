const typingForm =document.querySelector(".typing-form");
const chatlist =document.querySelector(".chat-list");
const toggleThemeButton = document.querySelector("#toggle-theme-button");
const deleteChatButton =document.querySelector("#delete-chat-button");
const suggestions =document.querySelectorAll(".suggestion-list .suggestion");

let userMessage=null;
let isResponseGenerating = false;

const API_KEY = "AIzaSyC3W_1d_pxo-Qlqs0O4bHt8fJYdkVYka0g";
const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${API_KEY}`;

const createMessageElement = (content, ...classes) => {
    const div =document.createElement("div");
    div.classList.add("message", ...classes);
    div.innerHTML=content;
    return div;
}

const showTypingEffect = (text, textElement) => {
    const words = text.split(' ');
    let currentWordIndex=0;

    const typingInterval = setInterval(() => {
        textElement.innerText += (currentWordIndex === 0 ? '' : ' ')+ words[currentWordIndex++];

        if(currentWordIndex === words.length){
            clearInterval(typingInterval);
            isResponseGenerating = false;
        }
    }, 75);
}

const generateAPIResponse = async (incomingMessageDiv) => {
    const textElement = incomingMessageDiv.querySelector(".text");
    try{
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{
                    role: "user",
                    parts: [{text: userMessage}]
                }]
            })
        });
        const data = await response.json();
        const apiResponse = data?.candidates[0].content.parts[0].text;
        showTypingEffect(apiResponse, textElement);
    }catch(error){
        isResponseGenerating = false;
        console.log(error);
    }finally{
        incomingMessageDiv.classList.remove("loading");
    }
}

const showLoadingAnimation = () => {
    const html = `
        <div class="message content">
            <img src="images/gemini.svg" alt="Gemini Image" class="avatar">
            <p class="text"></p>
            <div class="loading-indicator">
                <div class="loading-bar"></div>
                <div class="loading-bar"></div>
                <div class="loading-bar"></div>
            </div>
        </div>
        <span onclick="copyMessage(this)" class="icon material-symbols-rounded">content_copy</span>
    `;

    const incomingMessageDiv = createMessageElement(html, "incoming", "loading");
    chatlist.appendChild(incomingMessageDiv);

    generateAPIResponse(incomingMessageDiv);
};

const copyMessage = (copyIcon) => {
    const messageText = copyIcon.parentElement.querySelector(".text").innerText;

    navigator.clipboard.writeText(messageText);
    copyIcon.innerText ="done";
    setTimeout(() => copyIcon.innerText = "content_copy",1000);
}

const handleOutgoingChat = () => {
    userMessage= typingForm.querySelector(".typing-input").value.trim() || userMessage;
    if(!userMessage || isResponseGenerating) return;

    isResponseGenerating = true;

    const html = '<div class="message-content">\
                    <img src="images/user.jpg" alt="User Image" class="avatar">\
                    <p class="text"></p>\
                    </div>';
    
    const outgoingMessageDiv = createMessageElement(html,"outgoing");
    outgoingMessageDiv.querySelector(".text").innerText = userMessage;
    chatlist.appendChild(outgoingMessageDiv);

    typingForm.reset();
    document.body.classList.add("hide-header");
    setTimeout(showLoadingAnimation,500);

}

suggestions.forEach(suggestions => {
    suggestions.addEventListener("click", () => {
        userMessage = suggestions.querySelector(".text").innerText;
        handleOutgoingChat();
    });
});

toggleThemeButton.addEventListener("click", () => {
    const isLightMode = document.body.classList.toggle("light_mode");
    toggleThemeButton.innerText = isLightMode ? "dark_mode" : "light_mode";
});

deleteChatButton.addEventListener("click", () => {
    if (confirm("Are you sure you want to delete all messages?")) {
        localStorage.removeItem("savedChats");
        chatlist.innerHTML = ""; 
    }
});

typingForm.addEventListener("submit", (e) => {
    e.preventDefault();

    handleOutgoingChat();
});