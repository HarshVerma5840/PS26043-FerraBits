package com.saamyukt.SIH26043.evaluation.ai;

import com.google.genai.Client;
import com.google.genai.types.Content;
import com.google.genai.types.GenerateContentConfig;
import com.google.genai.types.GenerateContentResponse;
import com.google.genai.types.Part;
import com.google.genai.types.Schema;
import com.google.genai.types.Type;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;
import java.util.Arrays;
import java.util.List;
import java.util.ArrayList;
import java.util.Locale;
import java.util.stream.Stream;

@Service
@ConditionalOnProperty(name = "app.llm.scoring-provider", havingValue = "gemini", matchIfMissing = false)
public class GeminiCodeJudgeAdvisor implements AiAdvisor {

    private static final Logger log = LoggerFactory.getLogger(GeminiCodeJudgeAdvisor.class);

    private static final String SYSTEM_INSTRUCTION = 
            "You are an AI code reviewer performing semantic analysis on a student-submitted project repository.\n" +
            "You must evaluate the codebase against the stated problem requirements, architecture rules, and code quality heuristics.\n" +
            "Rules:\n" +
            "- Do NOT execute the code.\n" +
            "- Do NOT assume functionality exists if evidence is missing.\n" +
            "- Always cite specific evidence and files.\n" +
            "- Use INSUFFICIENT_EVIDENCE if the repository snapshot is incomplete.\n" +
            "- Return ONLY valid JSON matching the exact schema requested. No markdown, no prose.\n";

    private final String apiKey;
    private final String model;
    private final int maxRetries;
    private final double temperature;
    private final ObjectMapper objectMapper;

    public GeminiCodeJudgeAdvisor(
            @Value("${app.llm.gemini.api-key:}") String apiKey,
            @Value("${app.llm.gemini.model:gemini-3.1-flash}") String model,
            @Value("${app.llm.gemini.max-retries:2}") int maxRetries,
            @Value("${app.llm.gemini.temperature:0.1}") double temperature,
            ObjectMapper objectMapper) {
        this.apiKey = apiKey == null ? "" : apiKey.trim();
        this.model = model;
        this.maxRetries = maxRetries;
        this.temperature = temperature;
        this.objectMapper = objectMapper;
    }

    @Override
    public String model() {
        return model;
    }

    @Override
    public boolean configured() {
        return !apiKey.isEmpty();
    }

    @Override
    public Optional<Map<String, Object>> assess(CodeJudgeAiContext context) {
        if (!configured()) {
            return Optional.empty();
        }

        String userContent = buildUserContent(context);
        int attempts = Math.max(1, maxRetries + 1);
        Exception lastError = null;

        for (int attempt = 1; attempt <= attempts; attempt++) {
            try {
                return callGemini(userContent);
            } catch (Exception e) {
                lastError = e;
                log.warn("Gemini scoring attempt {}/{} failed: {}", attempt, attempts, e.getMessage());
            }
        }
        
        log.error("Gemini scoring failed after {} attempt(s)", attempts, lastError);
        return Optional.empty();
    }

    private String buildUserContent(CodeJudgeAiContext context) {
        StringBuilder sb = new StringBuilder();
        sb.append("Problem Title: ").append(context.submission().getProblemTitle()).append("\n");
        sb.append("Problem Description: ").append(context.submission().getProblemDescription()).append("\n");
        if (context.submission().getProblemExpectedOutcome() != null) {
            sb.append("Expected Outcome: ").append(context.submission().getProblemExpectedOutcome()).append("\n");
        }
        sb.append("\nCodeAnalysis and Security Findings Summary: \n");
        try {
            sb.append(objectMapper.writeValueAsString(context.evidenceSummary()));
        } catch (Exception e) {
            sb.append(context.evidenceSummary().toString());
        }
        sb.append("\nRepository URL: ").append(context.submission().getRepositoryUrl()).append("\n");
        sb.append("Commit SHA: ").append(context.submission().getCommitSha()).append("\n");

        sb.append("\n--- FILE TREE ---\n");
        sb.append(buildFileTree(context.workspaceDir(), 3, 200));

        sb.append("\n--- SELECTED FILE CONTENTS ---\n");
        sb.append(readImportantFiles(context.workspaceDir(), 50_000));

        return sb.toString();
    }

    private String buildFileTree(Path root, int maxDepth, int maxFiles) {
        if (root == null || !Files.exists(root)) {
            return "No workspace directory available.";
        }
        StringBuilder sb = new StringBuilder();
        int[] count = {0};
        try (Stream<Path> stream = Files.walk(root, maxDepth)) {
            stream.forEach(p -> {
                if (count[0] >= maxFiles) return;
                Path rel = root.relativize(p);
                if (rel.toString().isEmpty()) return;
                if (rel.toString().contains(".git")) return; // ignore git folder
                sb.append(rel.toString()).append(Files.isDirectory(p) ? "/" : "").append("\n");
                count[0]++;
            });
            if (count[0] >= maxFiles) {
                sb.append("... (truncated at ").append(maxFiles).append(" files)\n");
            }
        } catch (IOException e) {
            sb.append("Error reading file tree: ").append(e.getMessage());
        }
        return sb.toString();
    }

    private String readImportantFiles(Path root, int maxTotalBytes) {
        if (root == null || !Files.exists(root)) {
            return "";
        }
        StringBuilder sb = new StringBuilder();
        int[] bytesRead = {0};
        List<String> priorities = Arrays.asList(
                "readme.md", "readme",
                "package.json", "pom.xml", "build.gradle", "requirements.txt",
                "docker-compose.yml", "dockerfile",
                "security.md", "architecture.md", ".env.example"
        );
        try (Stream<Path> stream = Files.walk(root, 2)) {
            stream.filter(Files::isRegularFile).forEach(p -> {
                if (bytesRead[0] >= maxTotalBytes) return;
                String name = p.getFileName().toString().toLowerCase(Locale.ROOT);
                if (priorities.contains(name)) {
                    try {
                        String content = Files.readString(p, StandardCharsets.UTF_8);
                        if (content.length() > 10_000) {
                            content = content.substring(0, 10_000) + "\n... (truncated)\n";
                        }
                        if (bytesRead[0] + content.length() > maxTotalBytes) {
                            content = content.substring(0, maxTotalBytes - bytesRead[0]) + "\n... (truncated due to total limit)\n";
                        }
                        sb.append("File: ").append(root.relativize(p)).append("\n```\n").append(content).append("\n```\n\n");
                        bytesRead[0] += content.length();
                    } catch (Exception ignored) {
                    }
                }
            });
        } catch (IOException ignored) {
        }
        return sb.toString();
    }

    private Optional<Map<String, Object>> callGemini(String userContent) throws Exception {
        Client client = Client.builder()
                .apiKey(apiKey)
                .build();

        Schema responseSchema = buildResponseSchema();

        GenerateContentConfig config = GenerateContentConfig.builder()
                .systemInstruction(Content.fromParts(Part.fromText(SYSTEM_INSTRUCTION)))
                .responseMimeType("application/json")
                .responseSchema(responseSchema)
                .temperature((float) temperature)
                .build();

        GenerateContentResponse response = client.models.generateContent(
                model,
                userContent,
                config
        );

        if (response == null || response.text() == null || response.text().isBlank()) {
            throw new IllegalStateException("Gemini returned empty response");
        }

        String rawJson = response.text();
        Map<String, Object> parsed = objectMapper.readValue(rawJson, new TypeReference<Map<String, Object>>() {});
        return Optional.of(parsed);
    }

    private Schema buildResponseSchema() {
        return Schema.builder()
                .type(Type.Known.OBJECT)
                .properties(Map.of(
                        "analysis_version", Schema.builder().type(Type.Known.STRING).build(),
                        "overall_confidence", Schema.builder().type(Type.Known.NUMBER).build(),
                        "uncertainty_flags", Schema.builder().type(Type.Known.ARRAY)
                                .items(Schema.builder().type(Type.Known.STRING).build()).build(),
                        "requirement_assessments", Schema.builder().type(Type.Known.ARRAY)
                                .items(Schema.builder().type(Type.Known.OBJECT).properties(Map.of(
                                        "requirement_id", Schema.builder().type(Type.Known.STRING).build(),
                                        "status", Schema.builder().type(Type.Known.STRING)
                                                .enum_(Arrays.asList("SATISFIED", "PARTIALLY_SATISFIED", "NOT_SATISFIED", "INSUFFICIENT_EVIDENCE")).build(),
                                        "confidence", Schema.builder().type(Type.Known.NUMBER).build(),
                                        "reason_codes", Schema.builder().type(Type.Known.ARRAY).items(Schema.builder().type(Type.Known.STRING).build()).build(),
                                        "evidence", Schema.builder().type(Type.Known.ARRAY).items(Schema.builder().type(Type.Known.STRING).build()).build(),
                                        "files", Schema.builder().type(Type.Known.ARRAY).items(Schema.builder().type(Type.Known.STRING).build()).build(),
                                        "uncertainty", Schema.builder().type(Type.Known.STRING).nullable(true).build()
                                )).build()).build(),
                        "architecture_assessment", Schema.builder().type(Type.Known.OBJECT).properties(Map.of(
                                "status", Schema.builder().type(Type.Known.STRING).build(),
                                "confidence", Schema.builder().type(Type.Known.NUMBER).build(),
                                "reason_codes", Schema.builder().type(Type.Known.ARRAY).items(Schema.builder().type(Type.Known.STRING).build()).build(),
                                "evidence", Schema.builder().type(Type.Known.ARRAY).items(Schema.builder().type(Type.Known.STRING).build()).build()
                        )).build(),
                        "quality_observations", Schema.builder().type(Type.Known.ARRAY)
                                .items(Schema.builder().type(Type.Known.OBJECT).properties(Map.of(
                                        "category", Schema.builder().type(Type.Known.STRING).build(),
                                        "severity", Schema.builder().type(Type.Known.STRING).build(),
                                        "reason_codes", Schema.builder().type(Type.Known.ARRAY).items(Schema.builder().type(Type.Known.STRING).build()).build(),
                                        "evidence", Schema.builder().type(Type.Known.ARRAY).items(Schema.builder().type(Type.Known.STRING).build()).build()
                                )).build()).build()
                ))
                .required(Arrays.asList("analysis_version", "requirement_assessments", "architecture_assessment", "quality_observations", "uncertainty_flags", "overall_confidence"))
                .build();
    }
}
