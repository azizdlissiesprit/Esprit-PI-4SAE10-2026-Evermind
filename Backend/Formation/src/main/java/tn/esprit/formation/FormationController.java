package tn.esprit.formation;
import org.springframework.web.bind.annotation.*;
import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/formation")
@CrossOrigin(origins = "*")
public class FormationController {
    
    @GetMapping("/quiz")
    public List<Question> getQuiz() {
        return Arrays.asList(
            new Question(1, "What is the most common early symptom of Alzheimer's?", 
                Arrays.asList("Difficulty remembering newly learned information", "Severe physical pain", "Vision loss", "Hearing loss"), 0),
            new Question(2, "How should you communicate with an Alzheimer's patient?", 
                Arrays.asList("Talk very fast", "Use simple words and sentences, maintain eye contact", "Argue if they are wrong", "Ignore them"), 1),
            new Question(3, "If a patient is agitated, what is the best approach?", 
                Arrays.asList("Tell them to calm down immediately", "Restrain them", "Listen to their frustration, identify the cause, and redirect their attention", "Leave the room abruptly"), 2)
        );
    }
}
