package com.saamyukt.SIH26043.capabilitymatching.config;

import com.saamyukt.SIH26043.security.JwtAuthFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable())
            .cors(Customizer.withDefaults())
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/actuator/**", "/swagger-ui/**", "/swagger-ui.html", "/v3/api-docs/**", "/error").permitAll()
                .requestMatchers("/capability/api/v1/analytics/**", "/capability/api/v1/feedback/summary").permitAll()
                .requestMatchers(HttpMethod.GET, "/capability/api/v1/projects/*/feedback").permitAll()
                .requestMatchers(HttpMethod.POST, "/capability/api/v1/projects/*/feedback").permitAll()
                .requestMatchers("/capability/registry/import", "/capability/registry/publish", "/capability/admin/**", "/capability/governance/**").hasRole("ADMIN")
                .requestMatchers("/capability/registry", "/capability/registry/**").authenticated()
                .requestMatchers("/capability/runs", "/capability/runs/**", "/capability/api/v1/matching/run", "/api/v1/matching/run").hasAnyRole("ADMIN", "REVIEWER", "SUBMITTER")
                .requestMatchers("/capability/problems/**").authenticated()
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}
