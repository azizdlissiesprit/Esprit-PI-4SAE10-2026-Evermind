package tn.esprit.alert.Service;

import org.springframework.stereotype.Service;
import tn.esprit.alert.Entity.Alert;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

@Service
public class PredictiveAnalysisService {

    /**
     * Calculates the "Stability Trend" (Slope) using Linear Regression.
     * X-axis: Sequence of Alert (1, 2, 3...)
     * Y-axis: Gap in hours since previous alert
     *
     * Result < 0: Gaps are getting smaller (DANGER: Accelerating frequency)
     * Result > 0: Gaps are getting larger (Improving)
     */
    public double calculateStabilitySlope(List<Alert> history) {
        if (history.size() < 3) return 0.0; // Not enough data

        // Sort oldest to newest for calculations
        Collections.reverse(history);

        int n = history.size() - 1; // Number of gaps
        double sumX = 0;
        double sumY = 0;
        double sumXY = 0;
        double sumXX = 0;

        for (int i = 0; i < n; i++) {
            LocalDateTime current = history.get(i).getDateCreation();
            LocalDateTime next = history.get(i + 1).getDateCreation();

            // Calculate gap in hours
            double gapHours = Duration.between(current, next).toHours();

            // X is the index (1st gap, 2nd gap...)
            double x = i + 1;

            sumX += x;
            sumY += gapHours;
            sumXY += (x * gapHours);
            sumXX += (x * x);
        }

        // Formula for Slope (m) in y = mx + b
        // m = (n * Σ(xy) - Σx * Σy) / (n * Σ(x^2) - (Σx)^2)
        double numerator = (n * sumXY) - (sumX * sumY);
        double denominator = (n * sumXX) - (sumX * sumX);

        if (denominator == 0) return 0.0;

        return numerator / denominator;
    }

    public String interpretTrend(double slope) {
        if (slope < -5.0) return "CRITICAL DEGRADATION: Incidents are becoming significantly more frequent.";
        if (slope < 0.0) return "WARNING: Slight increase in frequency observed.";
        if (slope > 0.0) return "STABLE: Incident frequency is decreasing.";
        return "INSUFFICIENT DATA";
    }
}