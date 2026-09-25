package com.saamyukt.SIH26043.capabilitymatching.service.retrieval;

import com.saamyukt.SIH26043.capabilitymatching.dto.retrieval.RetrievalDTOs.CapabilityCandidate;
import com.saamyukt.SIH26043.capabilitymatching.dto.retrieval.RetrievalDTOs.SparseRetrievalRequest;

import java.util.List;

public interface SparseCapabilityRetriever {
    List<CapabilityCandidate> retrieve(SparseRetrievalRequest request);
}
