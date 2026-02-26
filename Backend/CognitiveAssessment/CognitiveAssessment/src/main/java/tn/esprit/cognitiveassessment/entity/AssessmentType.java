package tn.esprit.cognitiveassessment.entity;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum AssessmentType {
    initial("initial"),
    complete("complete"),
    follow_up("follow-up");

    private final String value;
    AssessmentType(String value) { this.value = value; }
    @JsonValue
    public String getValue() { return value; }
    @JsonCreator
    public static AssessmentType fromValue(String v) {
        if (v == null) return null;
        for (AssessmentType t : values()) if (t.value.equals(v)) return t;
        if ("follow-up".equals(v)) return follow_up;
        throw new IllegalArgumentException("Unknown AssessmentType: " + v);
    }
}
