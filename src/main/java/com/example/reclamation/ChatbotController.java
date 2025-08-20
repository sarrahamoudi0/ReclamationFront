package com.example.reclamation;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.json.JSONArray;
import org.json.JSONObject;

@RestController
@CrossOrigin(origins = "http://localhost:4200", maxAge = 3600, allowedHeaders = "*", allowCredentials = "true")
@RequestMapping("/api/chatbot")
public class ChatbotController {

    @Value("${ollama.api.url}")
    private String ollamaApiUrl;

    @Value("${ollama.model}")
    private String ollamaModel;

    @PostMapping("/ask")
    public ResponseEntity<String> ask(@RequestBody String questionText) {
        try {
            JSONObject input = new JSONObject(questionText);
            String question = input.optString("question", "").trim();

            if (question.isEmpty()) {
                return ResponseEntity.badRequest().body("Missing question in request.");
            }

            // Ajouter le prompt avant la question de l'utilisateur
            String fullPrompt = "repondre aux question comme service client de operateur orange : " + question;

            JSONArray messages = new JSONArray();
            messages.put(new JSONObject().put("role", "user").put("content", fullPrompt));

            JSONObject payload = new JSONObject();
            payload.put("model", ollamaModel);
            payload.put("messages", messages);
            payload.put("stream", false);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<String> entity = new HttpEntity<>(payload.toString(), headers);

            RestTemplate restTemplate = new RestTemplate();
            ResponseEntity<String> response = restTemplate.postForEntity(ollamaApiUrl, entity, String.class);

            System.out.println("Ollama raw response: " + response.getBody());

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                JSONObject respJson = new JSONObject(response.getBody());
                JSONObject message = respJson.optJSONObject("message");
                String content = message != null ? message.optString("content", "").trim() : "";

                if (content.isEmpty()) {
                    content = "Sorry, the chatbot replied with no content.";
                }

                return ResponseEntity.ok(content);
            }

            return ResponseEntity.status(response.getStatusCode())
                    .body("Error from Ollama: " + response.getStatusCodeValue());

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error talking to Ollama: " + e.getMessage());
        }
    }
}
