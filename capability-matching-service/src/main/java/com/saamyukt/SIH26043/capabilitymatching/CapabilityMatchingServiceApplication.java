package com.saamyukt.SIH26043.capabilitymatching;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@EnableDiscoveryClient
@ComponentScan(basePackages = {"com.saamyukt.SIH26043.capabilitymatching", "com.saamyukt.SIH26043.security"})
public class CapabilityMatchingServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(CapabilityMatchingServiceApplication.class, args);
    }
}
