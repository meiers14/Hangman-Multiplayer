import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket: WebSocket;

  private messageSubject = new Subject<any>();

  messages$ = this.messageSubject.asObservable();

  constructor() {
    this.connect();
    this.socket = new WebSocket('ws://localhost:8080/chat');
  }
  private connect() {
    this.socket = new WebSocket('ws://localhost:8080/chat');

    this.socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      this.messageSubject.next(message);
    };

    this.socket.onclose = () => {
      console.log('WebSocket connection closed');
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  sendMessage(message: string) {
    if (this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ message }));
    }
  }
}
