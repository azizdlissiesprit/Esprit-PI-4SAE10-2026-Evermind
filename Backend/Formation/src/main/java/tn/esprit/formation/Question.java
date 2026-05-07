package tn.esprit.formation;
import java.util.List;

public class Question {
    private int id;
    private String text;
    private List<String> options;
    private int correctAnswerIndex;

    public Question(int id, String text, List<String> options, int correctAnswerIndex) {
        this.id = id; this.text = text; this.options = options; this.correctAnswerIndex = correctAnswerIndex;
    }
    public int getId() { return id; }
    public String getText() { return text; }
    public List<String> getOptions() { return options; }
    public int getCorrectAnswerIndex() { return correctAnswerIndex; }
}
