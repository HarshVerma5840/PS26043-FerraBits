package com.saamyukt.SIH26043.capabilitymatching.repository;
import com.saamyukt.SIH26043.capabilitymatching.entity.FieldTest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;
import java.util.List;
@Repository
public interface FieldTestRepository extends JpaRepository<FieldTest, UUID> {
    List<FieldTest> findByProject_ProjectId(UUID projectId);
}
