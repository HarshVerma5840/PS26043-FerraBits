package com.saamyukt.SIH26043.web;

import com.saamyukt.SIH26043.entity.NotificationEvent;
import com.saamyukt.SIH26043.repository.NotificationEventRepository;
import com.saamyukt.SIH26043.security.AuthUser;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/notifications")
@PreAuthorize("isAuthenticated()")
public class NotificationController {

    private final NotificationEventRepository notificationEventRepository;

    public NotificationController(NotificationEventRepository notificationEventRepository) {
        this.notificationEventRepository = notificationEventRepository;
    }

    @GetMapping({"", "/my"})
    public Page<com.saamyukt.SIH26043.web.dto.NotificationResponse> getMyNotifications(@AuthenticationPrincipal AuthUser me, Pageable pageable) {
        return notificationEventRepository.findByUserIdOrderByCreatedAtDesc(me.getUserId(), pageable)
                .map(com.saamyukt.SIH26043.web.dto.NotificationResponse::from);
    }

    @GetMapping("/unread-count")
    public Map<String, Long> getUnreadCount(@AuthenticationPrincipal AuthUser me) {
        return Map.of("unreadCount", notificationEventRepository.countByUserIdAndReadFalse(me.getUserId()));
    }

    @PatchMapping("/{id}/read")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Transactional
    public void markAsRead(@PathVariable UUID id, @AuthenticationPrincipal AuthUser me) {
        notificationEventRepository.markAsRead(id, me.getUserId());
    }

    @PatchMapping("/read-all")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Transactional
    public void markAllAsRead(@AuthenticationPrincipal AuthUser me) {
        notificationEventRepository.markAllAsRead(me.getUserId());
    }
}
