package com.alzheimer.stock;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class ServiceStockApplication {

    public static void main(String[] args) {
        SpringApplication.run(ServiceStockApplication.class, args);
    }
}
