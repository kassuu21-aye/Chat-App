"use strict";

const STORAGE_KEY = "convo-chat-app-v1";
const MAX_MESSAGE_LENGTH = 2000;
const contacts = [
  { id: "maya", name: "Maya Chen", initials: "MC", role: "Product designer", color: "#f7e8d8", ink: "#a86e40" },
  { id: "leo", name: "Leo Martinez", initials: "LM", role: "Weekend explorer", color: "#e5e8fb", ink: "#6569aa" },
  { id: "amara", name: "Amara Okafor", initials: "AO", role: "Coffee enthusiast", color: "#f5e1e9", ink: "#a85d7b" },
  { id: "noah", name: "Noah Williams", initials: "NW", role: "Studio musician", color: "#deeee8", ink: "#47836f" },
  { id: "priya", name: "Priya Shah", initials: "PS", role: "Always learning", color: "#f4edcf", ink: "#998039" },
  { id: "elena", name: "Elena Petrova", initials: "EP", role: "Bookshop regular", color: "#e3edf6", ink: "#547b9f" }
];

const elements = {
  workspace: document.querySelector(".workspace"),
  contactList: document.getElementById("contact-list"),
  contactCount: document.getElementById("contact-count"),
  contactSearch: document.getElementById("contact-search"),
  noResults: document.getElementById("no-results"),
  emptySelection: document.getElementById("empty-selection"),
  activeChat: document.getElementById("active-chat"),
  chatPerson: document.getElementById("chat-person"),
  messageArea: document.getElementById("message-area"),
  messageInput: document.getElementById("message-input"),
  composer: document.getElementById("composer"),
  sendButton: document.getElementById("send-button"),
  clearButton: document.getElementById("clear-button"),
  backButton: document.getElementById("back-button"),
  storageNotice: document.getElementById("storage-notice")
};

let state = loadState();
let activeContactId = null;
let persistenceWarningShown = false;

function createSeedState() {
  const minutesAgo = (minutes) => new Date(Date.now() - minutes * 60 * 1000).toISOString();
  return {
    version: 1,
    conversations: {
      maya: {
        unread: 2,
        messages: [
          { id: "maya-1", sender: "them", text: "Hey! I found that little ceramics shop you mentioned.", timestamp: minutesAgo(250) },
          { id: "maya-2", sender: "me", text: "The one on Willow Street? I love that place.", timestamp: minutesAgo(242) },
          { id: "maya-3", sender: "them", text: "Yes! They have a new set of speckled mugs. We should go this weekend ☕", timestamp: minutesAgo(18) }
        ]
      },
      leo: {
        unread: 0,
        messages: [
          { id: "leo-1", sender: "me", text: "How was the coast trip?", timestamp: minutesAgo(1250) },
          { id: "leo-2", sender: "them", text: "So good. The sunset made the whole drive worth it.", timestamp: minutesAgo(1238) },
          { id: "leo-3", sender: "me", text: "Already adding it to my list for next time.", timestamp: minutesAgo(1210) }
        ]
      },
      amara: {
        unread: 1,
        messages: [
          { id: "amara-1", sender: "them", text: "I finally tried that little bakery near the park.", timestamp: minutesAgo(390) },
          { id: "amara-2", sender: "me", text: "The cardamom buns are unreal, right?", timestamp: minutesAgo(375) },
          { id: "amara-3", sender: "them", text: "Unreal. Saving you one next time!", timestamp: minutesAgo(64) }
        ]
      },
      noah: {
        unread: 0,
        messages: [
          { id: "noah-1", sender: "me", text: "Send me the track when you get a chance.", timestamp: minutesAgo(1600) },
          { id: "noah-2", sender: "them", text: "Just sent the demo over. Curious what you think.", timestamp: minutesAgo(1480) }
        ]
      },
      priya: {
        unread: 0,
        messages: [
          { id: "priya-1", sender: "them", text: "That book recommendation was exactly what I needed.", timestamp: minutesAgo(2580) },
          { id: "priya-2", sender: "me", text: "Glad it found you at the right time!", timestamp: minutesAgo(2520) }
        ]
      },
      elena: {
        unread: 0,
        messages: [
          { id: "elena-1", sender: "me", text: "Are you still hosting the book swap this month?", timestamp: minutesAgo(4300) },
          { id: "elena-2", sender: "them", text: "Yes, on the 24th! I'll send the details soon.", timestamp: minutesAgo(4200) }
        ]
      }
    }
  };
}

function isValidMessage(message) {
  return Boolean(
    message &&
    typeof message === "object" &&
    typeof message.id === "string" &&
    (message.sender === "me" || message.sender === "them") &&
    typeof message.text === "string" &&
    message.text.length <= MAX_MESSAGE_LENGTH &&
    typeof message.timestamp === "string" &&
    Number.isFinite(Date.parse(message.timestamp))
  );
}

function validateSavedState(value) {
  if (!value || typeof value !== "object" || value.version !== 1 || !value.conversations) {
    return false;
  }
  return contacts.every((contact) => {
    const conversation = value.conversations[contact.id];
    return Boolean(
      conversation &&
      Array.isArray(conversation.messages) &&
      conversation.messages.every(isValidMessage) &&
      Number.isInteger(conversation.unread) &&
      conversation.unread >= 0
    );
  });
}

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === null) {
      return createSeedState();
    }
    const parsed = JSON.parse(saved);
    if (!validateSavedState(parsed)) {
      showStorageNotice("Saved chat data was invalid, so the sample conversations were restored.");
      return createSeedState();
    }
    return parsed;
  } catch (error) {
    showStorageNotice("Saved chats could not be read. You can still use this demo, but changes may not be saved.");
    return createSeedState();
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch (error) {
    if (!persistenceWarningShown) {
      showStorageNotice("Your browser could not save changes. This conversation may not be here after you leave.");
      persistenceWarningShown = true;
    }
    return false;
  }
}

function showStorageNotice(message) {
  elements.storageNotice.textContent = message;
  elements.storageNotice.hidden = false;
}

function getContact(contactId) {
  return contacts.find((contact) => contact.id === contactId);
}

function getConversation(contactId) {
  return state.conversations[contactId];
}

function createAvatar(contact, className = "avatar") {
  const avatar = document.createElement("span");
  avatar.className = className;
  avatar.textContent = contact.initials;
  avatar.setAttribute("aria-hidden", "true");
  avatar.style.setProperty("--avatar-ink", contact.ink);
  avatar.style.backgroundColor = contact.color;
  return avatar;
}

function formatShortTime(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  if (date.toDateString() === now.toDateString()) {
    return new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(date);
  }
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(date);
}

function formatMessageTime(timestamp) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(timestamp));
}

function getLastMessage(conversation) {
  return conversation.messages[conversation.messages.length - 1] || null;
}

function renderContacts() {
  const query = elements.contactSearch.value.trim().toLocaleLowerCase();
  const filteredContacts = contacts.filter((contact) => contact.name.toLocaleLowerCase().includes(query));
  elements.contactList.replaceChildren();
  elements.contactCount.textContent = String(filteredContacts.length);
  elements.contactCount.setAttribute("aria-label", `${filteredContacts.length} contacts`);

  filteredContacts.forEach((contact) => {
    const conversation = getConversation(contact.id);
    const lastMessage = getLastMessage(conversation);
    const listItem = document.createElement("li");
    const button = document.createElement("button");
    button.type = "button";
    button.className = `contact-card${activeContactId === contact.id ? " is-active" : ""}`;
    button.setAttribute("aria-current", activeContactId === contact.id ? "true" : "false");
    button.setAttribute("aria-label", `${contact.name}${conversation.unread ? `, ${conversation.unread} unread` : ""}`);
    button.addEventListener("click", () => selectContact(contact.id));
    button.append(createAvatar(contact));

    const copy = document.createElement("span");
    copy.className = "contact-copy";
    const topLine = document.createElement("span");
    topLine.className = "contact-topline";
    const name = document.createElement("span");
    name.className = "contact-name";
    name.textContent = contact.name;
    topLine.append(name);

    const bottomLine = document.createElement("span");
    bottomLine.className = "contact-bottomline";
    const preview = document.createElement("span");
    preview.className = "contact-preview";
    preview.textContent = lastMessage ? lastMessage.text.replace(/\s+/g, " ").trim() : "No messages yet";
    if (lastMessage) {
      const time = document.createElement("time");
      time.className = "contact-time";
      time.dateTime = lastMessage.timestamp;
      time.textContent = formatShortTime(lastMessage.timestamp);
      topLine.append(time);
    }
    bottomLine.append(preview);
    if (conversation.unread > 0) {
      const badge = document.createElement("span");
      badge.className = "unread-badge";
      badge.textContent = String(conversation.unread);
      badge.setAttribute("aria-hidden", "true");
      bottomLine.append(badge);
    }
    copy.append(topLine, bottomLine);
    button.append(copy);
    listItem.append(button);
    elements.contactList.append(listItem);
  });
  elements.noResults.hidden = filteredContacts.length !== 0;
}

function renderChatHeader(contact) {
  elements.chatPerson.replaceChildren();
  elements.chatPerson.append(createAvatar(contact));
  const details = document.createElement("div");
  details.className = "person-details";
  const name = document.createElement("h2");
  name.textContent = contact.name;
  const role = document.createElement("p");
  role.textContent = contact.role;
  details.append(name, role);
  elements.chatPerson.append(details);
}

function createMessageIcon() {
  const namespace = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(namespace, "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("fill", "none");

  const paths = [
    {
      d: "M5 6.75A2.75 2.75 0 0 1 7.75 4h8.5A2.75 2.75 0 0 1 19 6.75v5.5A2.75 2.75 0 0 1 16.25 15H11l-4.5 3v-3.1A2.75 2.75 0 0 1 5 12.25v-5.5Z",
      "stroke-linejoin": "round"
    },
    {
      d: "M8.5 8.5h7M8.5 11.5h4",
      "stroke-linecap": "round"
    }
  ];

  paths.forEach((attributes) => {
    const path = document.createElementNS(namespace, "path");
    Object.entries({ stroke: "currentColor", "stroke-width": "1.6", ...attributes })
      .forEach(([name, value]) => path.setAttribute(name, value));
    svg.append(path);
  });
  return svg;
}

function renderMessages() {
  const conversation = getConversation(activeContactId);
  const contact = getContact(activeContactId);
  elements.messageArea.replaceChildren();
  elements.clearButton.disabled = conversation.messages.length === 0;

  if (conversation.messages.length === 0) {
    const empty = document.createElement("div");
    empty.className = "message-empty";
    const icon = document.createElement("span");
    icon.className = "message-empty-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.append(createMessageIcon());
    const title = document.createElement("strong");
    title.textContent = `A fresh start with ${contact.name.split(" ")[0]}`;
    const hint = document.createElement("p");
    hint.textContent = "Send a message to get the conversation going.";
    empty.append(icon, title, hint);
    elements.messageArea.append(empty);
    return;
  }

  const divider = document.createElement("div");
  divider.className = "day-divider";
  const dividerText = document.createElement("span");
  dividerText.textContent = "Conversation";
  divider.append(dividerText);
  elements.messageArea.append(divider);

  conversation.messages.forEach((message) => {
    const isSent = message.sender === "me";
    const row = document.createElement("article");
    row.className = `message-row${isSent ? " is-sent" : ""}`;
    row.setAttribute("aria-label", isSent ? "You" : contact.name);
    if (!isSent) {
      row.append(createAvatar(contact, "message-avatar"));
    }
    const content = document.createElement("div");
    content.className = "message-content";
    const bubble = document.createElement("div");
    bubble.className = "message-bubble";
    bubble.textContent = message.text;
    const time = document.createElement("time");
    time.className = "message-time";
    time.dateTime = message.timestamp;
    time.textContent = formatMessageTime(message.timestamp);
    content.append(bubble, time);
    row.append(content);
    elements.messageArea.append(row);
  });
  elements.messageArea.scrollTop = elements.messageArea.scrollHeight;
}

function selectContact(contactId) {
  activeContactId = contactId;
  getConversation(contactId).unread = 0;
  elements.emptySelection.hidden = true;
  elements.activeChat.hidden = false;
  elements.workspace.classList.add("is-chat-open");
  elements.messageInput.disabled = false;
  renderChatHeader(getContact(contactId));
  renderContacts();
  renderMessages();
  saveState();
}

function returnToContacts() {
  elements.workspace.classList.remove("is-chat-open");
  elements.contactSearch.focus();
}

function updateSendButton() {
  elements.sendButton.disabled = !activeContactId || !elements.messageInput.value.trim();
}

function sendMessage() {
  if (!activeContactId) {
    return;
  }
  const text = elements.messageInput.value.trim();
  if (!text || text.length > MAX_MESSAGE_LENGTH) {
    updateSendButton();
    return;
  }
  getConversation(activeContactId).messages.push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    sender: "me",
    text,
    timestamp: new Date().toISOString()
  });
  elements.messageInput.value = "";
  updateSendButton();
  renderMessages();
  renderContacts();
  saveState();
  elements.messageInput.focus();
}

function clearConversation() {
  if (!activeContactId) {
    return;
  }
  const contact = getContact(activeContactId);
  if (!window.confirm(`Clear all messages with ${contact.name}? This cannot be undone.`)) {
    return;
  }
  getConversation(activeContactId).messages = [];
  getConversation(activeContactId).unread = 0;
  renderMessages();
  renderContacts();
  saveState();
}

elements.contactSearch.addEventListener("input", renderContacts);
elements.messageInput.addEventListener("input", updateSendButton);
elements.messageInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
    event.preventDefault();
    sendMessage();
  }
});
elements.composer.addEventListener("submit", (event) => {
  event.preventDefault();
  sendMessage();
});
elements.clearButton.addEventListener("click", clearConversation);
elements.backButton.addEventListener("click", returnToContacts);

renderContacts();
