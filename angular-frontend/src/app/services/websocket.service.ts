import { Injectable } from '@angular/core';
import { Client, StompSubscription } from '@stomp/stompjs';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environment';

/**
 * WebsocketService handles WebSocket connections and subscriptions using STOMP.
 * It connects to the server, manages subscriptions for lobby, chat, and game topics.
 */
@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private client: Client;
  private connected: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor() {
    this.client = new Client({
      brokerURL: environment.wsUrl,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.client.onConnect = () => {
      this.connected.next(true);
    };

    this.client.onDisconnect = () => {
      this.connected.next(false);
    };

    this.client.activate();
  }

  isConnected(): Observable<boolean> {
    return this.connected.asObservable();
  }

  subscribeToLobby(lobbyCode: string, callback: (message: any) => void): StompSubscription {
    const destination = `/topic/lobby/${lobbyCode}`;
    return this.client.subscribe(destination, message => {
      callback(JSON.parse(message.body));
    });
  }

  subscribeToChat(lobbyCode: string, callback: (message: any) => void): StompSubscription {
    const destination = `/topic/chat/${lobbyCode}`;
    return this.client.subscribe(destination, message => {
      callback(JSON.parse(message.body));
    });
  }

  subscribeToGame(lobbyCode: string, callback: (message: any) => void): StompSubscription {
    const destination = `/topic/game/${lobbyCode}`;
    return this.client.subscribe(destination, message => {
      callback(JSON.parse(message.body));
    });
  }

  sendMessage(destination: string, body: any) {
    if (this.client.active) {
      this.client.publish({
        destination: destination,
        body: JSON.stringify(body)
      });
    } else {
      console.error("Cannot send message: STOMP client is not connected.");
    }
  }
}
