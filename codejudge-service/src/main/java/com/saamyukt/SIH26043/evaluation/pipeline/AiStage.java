package com.saamyukt.SIH26043.evaluation.pipeline;

import com.saamyukt.SIH26043.evaluation.ai.AiAdvisor;
import com.saamyukt.SIH26043.evaluation.ai.CodeJudgeAiContext;
import com.saamyukt.SIH26043.entity.AiEvaluation;
import com.saamyukt.SIH26043.entity.CodeAnalysis;
import com.saamyukt.SIH26043.entity.SecurityFinding;
import com.saamyukt.SIH26043.enums.EvaluationStatus;
import com.saamyukt.SIH26043.enums.FindingSeverity;
import com.saamyukt.SIH26043.repository.AiEvaluationRepository;
import com.saamyukt.SIH26043.repository.CodeAnalysisRepository;
import com.saamyukt.SIH26043.repository.ProjectSubmissionRepository;
import com.saamyukt.SIH26043.repository.SecurityFindingRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.ObjectMapper;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/**
 * AI_ANALYSIS stage (advisory). Feeds a compact evidence summary — deterministic
 * category scores + security finding counts — to the OpenAI-compatible local
 * model and stores one {@code ai_evaluation} row. With no LLM key the row is
 * recorded {@code UNAVAILABLE} and the pipeline continues; the AI output is
 * never consulted by the scoring engine.
 */
@Component
public class AiStage implements Stage {

    private static final Logger log = LoggerFactory.getLogger(AiStage.class);

    private final StageMachine stageMachine;
    private final CodeAnalysisRepository codeAnalysisRepository;
    private final SecurityFindingRepository securityFindingRepository;
    private final AiEvaluationRepository aiEvaluationRepository;
    private final ProjectSubmissionRepository projectSubmissionRepository;
    private final AiAdvisor aiAdvisor;
    private final ObjectMapper objectMapper;

    public AiStage(StageMachine stageMachine,
                   CodeAnalysisRepository codeAnalysisRepository,
                   SecurityFindingRepository securityFindingRepository,
                   AiEvaluationRepository aiEvaluationRepository,
                   ProjectSubmissionRepository projectSubmissionRepository,
                   AiAdvisor aiAdvisor,
                   ObjectMapper objectMapper) {
        this.stageMachine = stageMachine;
        this.codeAnalysisRepository = codeAnalysisRepository;
        this.securityFindingRepository = securityFindingRepository;
        this.aiEvaluationRepository = aiEvaluationRepository;
        this.projectSubmissionRepository = projectSubmissionRepository;
        this.aiAdvisor = aiAdvisor;
        this.objectMapper = objectMapper;
    }

    @Override
    public EvaluationStatus status() {
        return EvaluationStatus.AI_ANALYSIS;
    }

    @Override
    @Transactional
    public void execute(EvaluationContext context) {
        stageMachine.transition(context.getEvaluationId(), status(), "advisory AI assessment");

        aiEvaluationRepository.deleteByEvaluationId(context.getEvaluationId());

        Map<String, Object> summary = evidenceSummary(context.getEvaluationId());
        AiEvaluation row = new AiEvaluation();
        row.setEvaluationId(context.getEvaluationId());
        row.setPayload(summary);

        if (!aiAdvisor.configured()) {
            row.setStatus("UNAVAILABLE");
            row.setModel(null);
            row.getPayload().put("note", "LLM not configured; deterministic evidence only");
        } else {
            com.saamyukt.SIH26043.entity.ProjectSubmission submission = projectSubmissionRepository
                    .findById(context.getSubmissionId())
                    .orElseThrow(() -> new IllegalStateException("Submission not found"));

            CodeJudgeAiContext aiContext = new CodeJudgeAiContext(
                    submission,
                    context.getWorkspaceDir(),
                    summary
            );

            Optional<Map<String, Object>> assessment = aiAdvisor.assess(aiContext);
            if (assessment.isPresent()) {
                row.setStatus("AVAILABLE");
                row.setModel(aiAdvisor.model());
                Map<String, Object> advisory = new LinkedHashMap<>(assessment.get());
                advisory.putIfAbsent("evidence", summary);
                row.setPayload(advisory);
            } else {
                row.setStatus("ERROR");
                row.setModel(aiAdvisor.model());
                row.getPayload().put("note", "AI call failed or returned unusable JSON; advisory skipped");
            }
        }
        aiEvaluationRepository.save(row);
        log.info("Evaluation {} AI stage: {}", context.getEvaluationId(), row.getStatus());
    }

    private Map<String, Object> evidenceSummary(UUID evaluationId) {
        Map<String, Object> summary = new LinkedHashMap<>();
        Map<String, Object> categories = new LinkedHashMap<>();
        for (CodeAnalysis analysis : codeAnalysisRepository.findByEvaluationId(evaluationId)) {
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("score", analysis.getScore());
            entry.put("maxScore", analysis.getMaxScore());
            entry.put("tool", analysis.getTool());
            categories.put(analysis.getCategoryKey(), entry);
        }
        summary.put("categories", categories);

        List<SecurityFinding> findings = securityFindingRepository.findByEvaluationIdOrderBySeverityAsc(evaluationId);
        long critical = findings.stream().filter(f -> f.getSeverity() == FindingSeverity.CRITICAL).count();
        long high = findings.stream().filter(f -> f.getSeverity() == FindingSeverity.HIGH).count();
        Map<String, Object> security = new LinkedHashMap<>();
        security.put("count", findings.size());
        security.put("critical", critical);
        security.put("high", high);
        summary.put("securityFindings", security);
        return summary;
    }
}
