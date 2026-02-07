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

    /**
     * Create a notification for award approval.
     */
    public static function notifyAwardApproval(int $userId, string $awardNumber, ?int $awardId = null): Notification
    {
        $title = 'Housing Award Approved';
        $message = "Congratulations! Your housing award {$awardNumber} has been approved. Please review and accept the award within 30 days.";

        return self::create(
            $userId,
            'award_approved',
            $title,
            $message,
            'award',
            $awardId
        );
    }

    /**
     * Create a notification for award rejection.
     */
    public static function notifyAwardRejection(int $userId, string $awardNumber, string $reason, ?int $awardId = null): Notification
    {
        $title = 'Housing Award Rejected';
        $message = "Your housing award {$awardNumber} has been rejected. Reason: {$reason}";

        return self::create(
            $userId,
            'award_rejected',
            $title,
            $message,
            'award',
            $awardId
        );
    }

    /**
     * Create a notification for award acceptance.
     */
    public static function notifyAwardAcceptance(string $awardNumber, ?int $awardId = null): Notification
    {
        // This notification goes to admins, so we need to find the relevant admin users
        // For now, we'll create a system notification
        $title = 'Award Accepted';
        $message = "Housing award {$awardNumber} has been accepted by the beneficiary.";

        // In a real implementation, you'd send this to relevant admin users
        // For now, we'll return null as this needs user context
        return null;
    }

    /**
     * Create a notification for award decline.
     */
    public static function notifyAwardDecline(string $awardNumber, string $reason, ?int $awardId = null): Notification
    {
        $title = 'Award Declined';
        $message = "Housing award {$awardNumber} has been declined. Reason: {$reason}";

        // In a real implementation, you'd send this to relevant admin users
        return null;
    }

    /**
     * Create a notification for turnover scheduling.
     */
    public static function notifyTurnoverScheduled(int $userId, string $awardNumber, \DateTime $turnoverDate, ?int $awardId = null): Notification
    {
        $title = 'Unit Turnover Scheduled';
        $message = "Your unit turnover for award {$awardNumber} has been scheduled for {$turnoverDate->format('F d, Y')}. Please prepare for the turnover process.";

        return self::create(
            $userId,
            'turnover_scheduled',
            $title,
            $message,
            'award',
            $awardId
        );
    }
}
