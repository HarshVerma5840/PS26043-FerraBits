package com.saamyukt.SIH26043.evaluation.ai;

import com.saamyukt.SIH26043.entity.ProjectSubmission;

import java.nio.file.Path;
import java.util.Map;

public record CodeJudgeAiContext(
        ProjectSubmission submission,
        Path workspaceDir,
        Map<String, Object> evidenceSummary
) {
}
