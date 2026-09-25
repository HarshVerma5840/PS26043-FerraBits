package com.saamyukt.SIH26043.evaluation.ai;

import java.util.Map;
import java.util.Optional;

public interface AiAdvisor {
    String model();
    boolean configured();
    Optional<Map<String, Object>> assess(CodeJudgeAiContext context);
}
