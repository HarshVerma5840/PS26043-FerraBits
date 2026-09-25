package com.saamyukt.SIH26043.capabilitymatching;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class CapabilityMatchingServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(CapabilityMatchingServiceApplication.class, args);
    }
}
