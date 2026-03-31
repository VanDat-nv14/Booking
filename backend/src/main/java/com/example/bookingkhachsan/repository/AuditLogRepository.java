package com.example.bookingkhachsan.repository;

import com.example.bookingkhachsan.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findByModuleAndEntityIdOrderByCreatedAtDesc(String module, String entityId);
    List<AuditLog> findByPerformedByOrderByCreatedAtDesc(String performedBy);
    List<AuditLog> findByModuleOrderByCreatedAtDesc(String module);
}
