package com.dhbw.hangman.controller;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import java.util.Map;

@Controller
public class GameController {

    /**
     * Handles game updates for a lobby and broadcasts them to the corresponding topic.
     *
     * @param lobbyCode The lobby code identifying the game room.
     * @param update The game update details.
     * @return The processed update to be sent to the clients.
     */
    @MessageMapping("/game/{lobbyCode}")
    @SendTo("/topic/game/{lobbyCode}")
    public Map<String, Object> handleGameUpdate(@DestinationVariable String lobbyCode, Map<String, Object> update) {
        System.out.println("Received game update for lobby " + lobbyCode + ": " + update);
        return update;
    }
}
