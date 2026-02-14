package tn.esprit.product.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.product.Entity.Product;

public interface ProductRepository extends JpaRepository<Product, Long> {


}
