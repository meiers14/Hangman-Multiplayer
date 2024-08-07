package com.dhbw.hangman.controller;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import java.util.Map;

@Controller
public class GameController {

    @MessageMapping("/game/{lobbyCode}")
    @SendTo("/topic/game/{lobbyCode}")
    public Map<String, Object> handleGameUpdate(Map<String, Object> update) {
        return update;
    }
}
