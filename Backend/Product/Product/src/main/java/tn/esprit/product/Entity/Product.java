package tn.esprit.product.Entity;

// Import from your existing Enum
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Entity
@Table(name = "products")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long productId;

    @Column(nullable = false)
    private String name;

    @Column(length = 1000)
    private String description;

    // Technical specs displayed to the user
    private String batteryLife;   // e.g., "48 hours"
    private String connectivity;  // e.g., "WiFi + 4G"

    @Column(nullable = false)
    private BigDecimal price;

    private Integer stockQuantity;

    private String imageUrl;

    @Enumerated(EnumType.STRING)
    private ProductCategory category;


    // Recommendation engine (e.g., "Early Stage", "Wandering Risk")
    private String recommendedFor;
}