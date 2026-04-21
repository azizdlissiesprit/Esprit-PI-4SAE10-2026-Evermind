package tn.esprit.loginlog.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.loginlog.entity.LoginHistory;
import tn.esprit.loginlog.repository.LoginHistoryRepository;

import java.util.List;

@RestController
@RequestMapping("/login-history")
@RequiredArgsConstructor
public class LoginHistoryController {

    private final LoginHistoryRepository loginHistoryRepository;

    @GetMapping
    public ResponseEntity<List<LoginHistory>> getAllLoginHistory() {
        return ResponseEntity.ok(loginHistoryRepository.findAllByOrderByLoginTimeDesc());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<LoginHistory>> getLoginHistoryByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(loginHistoryRepository.findByUserIdOrderByLoginTimeDesc(userId));
    }

    @GetMapping("/count")
    public ResponseEntity<Long> getTotalLoginCount() {
        return ResponseEntity.ok(loginHistoryRepository.count());
    }
}
