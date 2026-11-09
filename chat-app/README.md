# Convo — Chat App

A beginner-friendly messaging UI built with semantic HTML, CSS, and vanilla JavaScript. It runs entirely in your browser and does not need an account, backend, or build step.

## Run with VS Code Live Server

1. Open the `chat-app` folder in Visual Studio Code.
2. Install the **Live Server** extension if it is not already installed.
3. In the Explorer, right-click `index.html` and choose **Open with Live Server**.
4. The app opens in your browser. You can also open `index.html` directly, but Live Server provides a more consistent local development experience.

## Features

- Responsive contacts list and conversation view, including a mobile back-to-contacts control.
- Six sample contacts with initials, message previews, timestamps, and unread indicators.
- Search contacts by name and mark a conversation read when it is opened.
- Send messages with the button or Enter; Shift + Enter inserts a new line.
- Conversation history and unread state saved in browser LocalStorage.
- Clear a conversation after confirming the action.
- Accessible labels, keyboard focus styles, disabled controls, and empty states.

## Limitations

- This is a local demo, not a real messaging service. Messages are not delivered to other people and there is no real-time messaging, account, or server.
- Data is stored only in this browser's LocalStorage. Clearing browser data or using another browser/device will not preserve conversations.
- Sample contacts and their initial conversations are demonstration content.

## Test checklist

- [ ] Open the app at desktop width and confirm both contacts and the empty conversation state appear.
- [ ] Select a contact; confirm its conversation opens and its unread badge clears.
- [ ] Search by a full or partial contact name, then search for a name with no match.
- [ ] Send a normal message using the button and Enter; verify whitespace-only messages cannot be sent.
- [ ] Use Shift + Enter to add a line without sending.
- [ ] Reload the page and verify sent messages and unread state are restored.
- [ ] Clear a conversation, cancel once, then confirm the clear action; check the resulting empty state.
- [ ] Resize to a narrow/mobile viewport, open a contact, and use the back button to return to contacts.
- [ ] Use Tab and keyboard activation to check visible focus and accessible controls.
