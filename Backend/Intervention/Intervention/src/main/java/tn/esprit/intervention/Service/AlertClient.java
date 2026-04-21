package tn.esprit.intervention.Service;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PutMapping;

import org.springframework.web.bind.annotation.PathVariable;


@FeignClient(name = "ALERT", path = "/alert")



public interface AlertClient {

    @PutMapping("/resolve/{id}")
    void resolveAlert(@PathVariable("id") Long id);

    @PutMapping("/take-charge/{id}")
    void takeCharge(@PathVariable("id") Long id);

}
