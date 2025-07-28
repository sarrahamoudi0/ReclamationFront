import { Component } from '@angular/core';
import { ChatbotService } from '../chatbot.service';


interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
}

@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.scss']
})
export class ChatbotComponent {
  messages: ChatMessage[] = [
    { sender: 'bot', text: 'Hello! I am your  assistant. Ask me anything about the platform.' }
  ];
  userInput = '';
  loading = false;
  open = false;

  constructor(private chatbotService: ChatbotService) {}

  sendMessage() {
    const question = this.userInput.trim();
    if (!question) return;

    this.messages.push({ sender: 'user', text: question });
    this.userInput = '';
    this.loading = true;

    this.chatbotService.ask(question).subscribe({
      next: (res: string) => {
        this.messages.push({ sender: 'bot', text: res });
        this.loading = false;
      },
      error: () => {
        this.messages.push({ sender: 'bot', text: 'Sorry, I could not get a response.' });
        this.loading = false;
      }
    });
  }

  handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  toggleChat() {
    this.open = !this.open;
  }
}
