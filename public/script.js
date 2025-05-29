document.addEventListener("DOMContentLoaded", function () {
    // Integração EmailJS
    emailjs.init("Ztf5TxtuJESPKR8LC"); // Sua chave pública do EmailJS

    document.getElementById('contactForm').addEventListener('submit', async function (event) {
        event.preventDefault();

        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const message = document.getElementById('message').value.trim();
        const responseMessage = document.getElementById('responseMessage');

        if (!name || !email || !message) {
            responseMessage.innerText = "Por favor, preencha todos os campos.";
            responseMessage.style.color = "red";
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            responseMessage.innerText = "Por favor, insira um e-mail válido.";
            responseMessage.style.color = "red";
            return;
        }

        responseMessage.innerText = "Enviando mensagem...";
        responseMessage.style.color = "black";

        const templateParams = {
            from_name: name,
            from_email: email,
            message: message
        };

        try {
            const response = await emailjs.send("service_07frwli", "template_db13fms", templateParams, "Ztf5TxtuJESPKR8LC");

            responseMessage.innerText = `Obrigado, ${name}! Sua mensagem foi enviada com sucesso.`;
            responseMessage.style.color = "green";

            event.target.reset();
        } catch (error) {
            console.error('Erro ao enviar mensagem:', error);
            responseMessage.innerText = 'Houve um erro ao enviar sua mensagem. Tente novamente mais tarde.';
            responseMessage.style.color = "red";
        }
    });

    // Lógica do Chatbot de IA
    const chatbotButton = document.getElementById('chatbot-button');
    const chatbotContainer = document.getElementById('chatbot-container');
    const chatbotCloseButton = chatbotContainer.querySelector('.chatbot-close-button');
    const chatbotMessages = document.getElementById('chatbot-messages');
    const chatbotInput = document.getElementById('chatbot-input');
    const chatbotSendButton = document.getElementById('chatbot-send-button');

    let chatHistory = [];

    const initialAiGreeting = "Olá! Eu sou a IA do Portal de Arembepe. Posso responder a perguntas sobre o condomínio, seus desafios e as medidas propostas para a revitalização. Em que posso ajudar?";
    
    const initialAIBubble = document.createElement('div');
    initialAIBubble.classList.add('message-bubble', 'message-ai');
    initialAIBubble.innerText = initialAiGreeting;
    chatbotMessages.appendChild(initialAIBubble);
    chatHistory.push({ role: "model", parts: [{ text: initialAiGreeting }] });


    chatbotButton.addEventListener('click', () => {
        chatbotContainer.classList.toggle('active');
        if (chatbotContainer.classList.contains('active')) {
            chatbotInput.focus();
            chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
        }
    });

    chatbotCloseButton.addEventListener('click', () => {
        chatbotContainer.classList.remove('active');
    });

    async function sendMessageToAI() {
        const userMessageText = chatbotInput.value.trim();
        if (!userMessageText) return;

        const userBubble = document.createElement('div');
        userBubble.classList.add('message-bubble', 'message-user');
        userBubble.innerText = userMessageText;
        chatbotMessages.appendChild(userBubble);

        chatHistory.push({
            role: "user",
            parts: [{ text: userMessageText }]
        });

        const loadingBubble = document.createElement('div');
        loadingBubble.classList.add('message-bubble', 'message-loading');
        loadingBubble.innerText = 'Digitando...';
        chatbotMessages.appendChild(loadingBubble);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;

        chatbotInput.value = '';

        try {
            // --- ATENÇÃO: ESTA URL DEVE SER ATUALIZADA MANUALMENTE ---
            // 1. Depois de fazer o deploy do SEU BACKEND no Render.com,
            // 2. Copie a URL REAL do seu Web Service (ex: https://seu-backend.onrender.com)
            // 3. Cole-a abaixo, adicionando "/chat" no final.
            const backendUrl = 'https://revitaliza-backend.onrender.com'; // <-- ATUALIZE AQUI
            
            const payload = {
                user_message: userMessageText,
                chat_history: chatHistory.slice(0, -1)
            };

            const response = await fetch(backendUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            console.log("Response status:", response.status);
            console.log("Response OK status:", response.ok);

            const responseClone = response.clone();
            const responseText = await responseClone.text();
            console.log("Response Text (raw):", responseText);

            let result;
            try {
                result = JSON.parse(responseText);
                console.log("Response JSON (parsed):", result);
            } catch (jsonError) {
                console.error("Erro ao parsear JSON:", jsonError);
                console.log("Resposta não é JSON válido.");
                loadingBubble.classList.remove('message-loading');
                loadingBubble.classList.add('message-ai');
                loadingBubble.innerText = `Erro: Resposta inesperada do servidor. Conteúdo: ${responseText.substring(0, Math.min(responseText.length, 100))}...`;
                chatHistory.push({ role: "model", parts: [{ text: loadingBubble.innerText }] });
                return; 
            }

            if (result.ai_response) {
                const aiResponseText = result.ai_response;
                loadingBubble.classList.remove('message-loading');
                loadingBubble.classList.add('message-ai');
                loadingBubble.innerText = aiResponseText;

                chatHistory.push({
                    role: "model",
                    parts: [{ text: aiResponseText }]
                });
            } else if (result.error) {
                loadingBubble.classList.remove('message-loading');
                loadingBubble.classList.add('message-ai');
                loadingBubble.innerText = `Erro: ${result.error}`;
                chatHistory.push({
                    role: "model",
                    parts: [{ text: `Erro: ${result.error}` }]
                });
            } else {
                loadingBubble.classList.remove('message-loading');
                loadingBubble.classList.add('message-ai');
                loadingBubble.innerText = "Desculpe, não consegui gerar uma resposta com base nas informações disponíveis. Resposta inesperada do servidor.";
                chatHistory.push({
                    role: "model",
                    parts: [{ text: "Desculpe, não consegui gerar uma resposta com base nas informações disponíveis. Resposta inesperada do servidor." }]
                });
            }
        } catch (error) {
            console.error('Erro ao chamar o backend (geral do fetch):', error);
            loadingBubble.classList.remove('message-loading');
            loadingBubble.classList.add('message-ai');
            loadingBubble.innerText = "Ocorreu um erro ao processar sua pergunta. Por favor, tente novamente.";
            chatHistory.push({
                role: "model",
                parts: [{ text: "Ocorreu um erro ao processar sua pergunta. Por favor, tente novamente." }]
            });
        } finally {
            chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
        }
    }

    chatbotSendButton.addEventListener('click', sendMessageToAI);
    chatbotInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessageToAI();
        }
    });
});
