let conversations = [];
let currentConversationIndex = -1;

document.getElementById("send-button").addEventListener("click", async () => {
	const apiKey = document.getElementById("api-key").value;
	const userInput = document.getElementById("user-input").value;
	const responseContainer = document.getElementById("response");

	if (!apiKey) {
		alert("Veuillez entrer votre clé API !");
		return;
	}

	if (!userInput) {
		alert("Veuillez écrire un message !");
		return;
	}

	// Afficher le message utilisateur
	const userMessage = document.createElement("div");
	userMessage.className = "message user";
	userMessage.textContent = userInput;
	responseContainer.appendChild(userMessage);

	// Réinitialiser le champ d'entrée utilisateur
	document.getElementById("user-input").value = "";

	// Ajouter la conversation si nécessaire
	if (currentConversationIndex === -1) {
		conversations.push({ messages: [] });
		currentConversationIndex = conversations.length - 1;
	}

	// Ajouter le message utilisateur à la conversation en cours
	conversations[currentConversationIndex].messages.push({
		role: "user",
		content: userInput,
	});

	try {
		const response = await fetch("https://api.openai.com/v1/chat/completions", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${apiKey}`,
			},
			body: JSON.stringify({
				model: "gpt-3.5-turbo",
				messages: [
					{ role: "system", content: "You are a helpful assistant." },
					{ role: "user", content: userInput },
				],
				max_tokens: 200,
			}),
		});

		const data = await response.json();
		const assistantMessage = document.createElement("div");
		assistantMessage.className = "message assistant";

		if (response.ok) {
			assistantMessage.textContent = data.choices[0].message.content.trim();
			conversations[currentConversationIndex].messages.push({
				role: "assistant",
				content: data.choices[0].message.content.trim(),
			});
		} else {
			assistantMessage.textContent = `Erreur : ${data.error.message}`;
		}

		responseContainer.appendChild(assistantMessage);
	} catch (error) {
		const errorMessage = document.createElement("div");
		errorMessage.className = "message error";
		errorMessage.textContent = `Erreur de connexion : ${error.message}`;
		responseContainer.appendChild(errorMessage);
	}

	// Faire défiler vers le bas pour toujours afficher le dernier message
	responseContainer.scrollTop = responseContainer.scrollHeight;
});

// Bouton pour créer une nouvelle conversation
document
	.getElementById("new-conversation-button")
	.addEventListener("click", () => {
		// Créer une nouvelle conversation
		conversations.push({ messages: [] });
		currentConversationIndex = conversations.length - 1;

		// Mettre à jour la liste des conversations et afficher la nouvelle conversation
		updateConversationList();
		displayConversation(currentConversationIndex);
	});

// Bouton pour effacer la conversation actuelle
document.getElementById("clear-button").addEventListener("click", () => {
	const responseContainer = document.getElementById("response");
	responseContainer.innerHTML = "";
	if (currentConversationIndex !== -1) {
		conversations[currentConversationIndex].messages = [];
	}
});

// Bouton pour effacer toutes les conversations
document.getElementById("clear-all-button").addEventListener("click", () => {
	const responseContainer = document.getElementById("response");
	responseContainer.innerHTML = "";
	conversations = [];
	currentConversationIndex = -1;
	updateConversationList();
});

// Met à jour la liste des conversations
function updateConversationList() {
	const conversationList = document.querySelector(".conversation-list");
	conversationList.innerHTML = "";

	conversations.forEach((conversation, index) => {
		const button = document.createElement("button");
		button.textContent = `Conversation ${index + 1}`;
		button.addEventListener("click", () => {
			currentConversationIndex = index;
			displayConversation(index);
		});
		conversationList.appendChild(button);
	});
}

// Affiche une conversation spécifique
function displayConversation(index) {
	const responseContainer = document.getElementById("response");
	responseContainer.innerHTML = "";

	const conversation = conversations[index];
	conversation.messages.forEach((message) => {
		const messageDiv = document.createElement("div");
		messageDiv.className = `message ${message.role}`;
		messageDiv.textContent = message.content;
		responseContainer.appendChild(messageDiv);
	});
}

// Initialisation de la première conversation (vide) et mise à jour de la liste des conversations
window.addEventListener("load", () => {
	conversations.push({ messages: [] }); // Créer la première conversation vide
	currentConversationIndex = 0; // La première conversation est sélectionnée
	updateConversationList(); // Met à jour la liste des conversations
	displayConversation(0); // Affiche la première conversation
});
