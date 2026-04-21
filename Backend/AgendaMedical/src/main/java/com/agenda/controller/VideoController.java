package com.agenda.controller;

import com.agenda.dto.VideoRoomRequest;
import com.agenda.dto.VideoRoomResponse;
import com.agenda.service.DailyCoService;
import com.agenda.repository.RendezVousRepository;
import com.agenda.entity.RendezVous;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/video")
public class VideoController {

    @Autowired
    private DailyCoService dailyCoService;

    @Autowired
    private RendezVousRepository rendezVousRepository;

    // Créer une room pour un rendez-vous
    @PostMapping("/room")
    public ResponseEntity<VideoRoomResponse> createRoom(@RequestBody VideoRoomRequest req) {
        try {
            String roomName = "rdv-" + req.getRendezVousId() + "-" + System.currentTimeMillis();

            Map<String, Object> room = dailyCoService.createRoom(roomName);
            String roomUrl = (String) room.get("url");

            // Sauvegarder l'URL dans le rendez-vous
            RendezVous rdv = rendezVousRepository.findById(req.getRendezVousId())
                .orElseThrow(() -> new RuntimeException("RDV non trouvé"));
            
            // Mettre à jour les champs vidéo (assumant qu'ils existent)
            rdv.setRoomUrl(roomUrl);
            rdv.setRoomName(roomName);
            rendezVousRepository.save(rdv);

            VideoRoomResponse response = new VideoRoomResponse(roomUrl, roomName, req.getRendezVousId());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de la création de la room vidéo: " + e.getMessage());
        }
    }

    // Obtenir un token sécurisé pour rejoindre
    @PostMapping("/token")
    public ResponseEntity<Map<String, String>> getToken(
        @RequestParam String roomName,
        @RequestParam String userName
    ) {
        try {
            String token = dailyCoService.createMeetingToken(roomName, userName);
            return ResponseEntity.ok(Map.of("token", token));
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de la création du token: " + e.getMessage());
        }
    }

    // Récupérer l'URL d'un RDV existant
    @GetMapping("/room/{rendezVousId}")
    public ResponseEntity<VideoRoomResponse> getRoom(@PathVariable Long rendezVousId) {
        try {
            RendezVous rdv = rendezVousRepository.findById(rendezVousId)
                .orElseThrow(() -> new RuntimeException("RDV non trouvé"));

            VideoRoomResponse response = new VideoRoomResponse(
                rdv.getRoomUrl(), 
                rdv.getRoomName(), 
                rendezVousId
            );
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de la récupération de la room: " + e.getMessage());
        }
    }
}
