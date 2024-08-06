import { Injectable } from '@angular/core';
import { Client, StompSubscription } from '@stomp/stompjs';
import * as Stomp from '@stomp/stompjs';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private client: Client;
  private connected: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor() {
    this.client = new Stomp.Client({
      brokerURL: 'ws://localhost:8080/chat',  // Die URL des WebSocket-Endpunkts
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (msg: string) => {
        console.log(new Date(), msg);
      }
    });

    this.client.onConnect = () => {
      console.log('Connected');
      this.connected.next(true);
    };

    this.client.onDisconnect = () => {
      console.log('Disconnected');
      this.connected.next(false);
    };

    this.client.activate();
  }

  isConnected(): Observable<boolean> {
    return this.connected.asObservable();
  }

  subscribe(lobbyCode: string, callback: (message: any) => void): StompSubscription {
    const destination = `/topic/chat/${lobbyCode}`;
    return this.client.subscribe(destination, message => {
      console.log('Received message:', message.body);  // Debugging-Ausgabe
      callback(JSON.parse(message.body));
    });
  }



  sendMessage(destination: string, body: any) {
    this.client.publish({
      destination: destination,
      body: JSON.stringify(body)
    });
  }
}