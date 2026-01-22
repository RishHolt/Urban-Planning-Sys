<?php

namespace App\Services;

use App\Models\Notification;

class NotificationService
{
    /**
     * Create a notification for a user.
     */
    public static function create(int $userId, string $type, string $title, string $message, ?string $resourceType = null, ?int $resourceId = null): Notification
    {
        return Notification::create([
            'user_id' => $userId,
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'resource_type' => $resourceType,
            'resource_id' => $resourceId,
        ]);
    }

    /**
     * Create a notification for application status change.
     */
    public static function notifyApplicationStatusChange(int $userId, string $applicationNumber, ?string $oldStatus, string $newStatus, ?int $applicationId = null): Notification
    {
        $title = 'Application Status Updated';
        $message = $oldStatus
            ? "Your housing beneficiary application {$applicationNumber} status has been changed from ".
                self::formatStatus($oldStatus).' to '.self::formatStatus($newStatus).'.'
            : "Your housing beneficiary application {$applicationNumber} has been {$newStatus}.";

        return self::create(
            $userId,
            'application_status_change',
            $title,
            $message,
            'housing_beneficiary_application',
            $applicationId
        );
    }

    /**
     * Create a notification for document request.
     */
    public static function notifyDocumentRequest(int $userId, string $applicationNumber, array $documentTypes, string $adminMessage, ?int $applicationId = null): Notification
    {
        $documentsList = implode(', ', array_map(function ($type) {
            return self::formatDocumentType($type);
        }, $documentTypes));

        $title = 'Document Request';
        $message = "Additional documents are required for your housing beneficiary application {$applicationNumber}. ".
            "Please upload: {$documentsList}. ".
            ($adminMessage ? "Note: {$adminMessage}" : '');

        return self::create(
            $userId,
            'document_request',
            $title,
            $message,
            'housing_beneficiary_application',
            $applicationId
        );
    }

    /**
     * Create a notification for application approval.
     */
    public static function notifyApplicationApproved(int $userId, string $applicationNumber, ?int $applicationId = null): Notification
    {
        $title = 'Application Approved';
        $message = "Congratulations! Your housing beneficiary application {$applicationNumber} has been approved.";

        return self::create(
            $userId,
            'application_approved',
            $title,
            $message,
            'housing_beneficiary_application',
            $applicationId
        );
    }

    /**
     * Create a notification for application rejection.
     */
    public static function notifyApplicationRejected(int $userId, string $applicationNumber, ?string $rejectionReason = null, ?int $applicationId = null): Notification
    {
        $title = 'Application Rejected';
        $message = "Your housing beneficiary application {$applicationNumber} has been rejected.";
        if ($rejectionReason) {
            $message .= " Reason: {$rejectionReason}";
        }

        return self::create(
            $userId,
            'application_rejected',
            $title,
            $message,
            'housing_beneficiary_application',
            $applicationId
        );
    }

    /**
     * Format status for display.
     */
    private static function formatStatus(string $status): string
    {
        return match ($status) {
            'draft' => 'Draft',
            'submitted' => 'Submitted',
            'under_review' => 'Under Review',
            'approved' => 'Approved',
            'rejected' => 'Rejected',
            default => $status,
        };
    }

    /**
     * Format document type for display.
     */
    private static function formatDocumentType(string $type): string
    {
        return match ($type) {
            'proof_of_identity' => 'Proof of Identity',
            'proof_of_income' => 'Proof of Income',
            'proof_of_residence' => 'Proof of Residence',
            'special_eligibility_certificate' => 'Special Eligibility Certificate',
            default => str_replace('_', ' ', ucwords($type, '_')),
        };
    }
}
