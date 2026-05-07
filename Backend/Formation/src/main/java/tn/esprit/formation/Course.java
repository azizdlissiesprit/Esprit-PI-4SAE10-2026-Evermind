package tn.esprit.formation;

public class Course {
    private int id;
    private String title;
    private String description;
    private int durationMinutes;
    private String difficultyLevel;

    public Course(int id, String title, String description, int durationMinutes, String difficultyLevel) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.durationMinutes = durationMinutes;
        this.difficultyLevel = difficultyLevel;
    }

    public int getId() { return id; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public int getDurationMinutes() { return durationMinutes; }
    public String getDifficultyLevel() { return difficultyLevel; }
}
