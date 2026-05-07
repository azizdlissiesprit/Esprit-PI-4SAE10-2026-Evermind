package tn.esprit.formation;
import org.springframework.web.bind.annotation.*;
import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/formation")
@CrossOrigin(origins = "*")
public class FormationController {
    
    @GetMapping("/courses")
    public List<Course> getCourses() {
        return Arrays.asList(
            new Course(1, "Alzheimer's Basics", "Understand the early signs and progression of Alzheimer's disease.", 45, "Beginner"),
            new Course(2, "Effective Communication", "Learn techniques to communicate without causing frustration or confusion.", 60, "Intermediate"),
            new Course(3, "Handling Agitation & Aggression", "Strategies to manage difficult behaviors safely and empathetically.", 90, "Advanced"),
            new Course(4, "Creating a Safe Environment", "How to modify a living space to prevent wandering and accidents.", 30, "Beginner")
        );
    }

    @GetMapping("/quiz")
    public List<Question> getQuiz() {
        return Arrays.asList(
            new Question(1, "What is the most common early symptom of Alzheimer's?", 
                Arrays.asList("Difficulty remembering newly learned information", "Severe physical pain", "Vision loss", "Hearing loss"), 0),
            new Question(2, "How should you communicate with an Alzheimer's patient?", 
                Arrays.asList("Talk very fast", "Use simple words and sentences, maintain eye contact", "Argue if they are wrong", "Ignore them"), 1),
            new Question(3, "If a patient is agitated, what is the best approach?", 
                Arrays.asList("Tell them to calm down immediately", "Restrain them", "Listen to their frustration, identify the cause, and redirect their attention", "Leave the room abruptly"), 2),
            new Question(4, "When a patient repeats the same question multiple times, you should:", 
                Arrays.asList("Remind them they already asked", "Answer calmly every time or gently redirect the conversation", "Ignore the question", "Act annoyed so they stop"), 1),
            new Question(5, "What is 'Sundowning' in the context of Alzheimer's?", 
                Arrays.asList("Waking up very early", "A period of increased confusion, anxiety, or agitation beginning late in the afternoon or early evening", "Refusing to sleep in a bed", "Sunburn sensitivity"), 1)
        );
    }
}
