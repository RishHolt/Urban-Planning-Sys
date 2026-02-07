<?php

namespace App\Policies;

use App\Models\BeneficiaryApplication;
use App\Models\User;

class BeneficiaryApplicationPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        // All authenticated users can view their own applications
        // Admins can view all applications (handled in controller)
        return true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, BeneficiaryApplication $application): bool
    {
        // Users can view their own applications (via beneficiary.citizen_id)
        if ($application->beneficiary->citizen_id == $user->id) {
            return true;
        }

        // Admins and staff can view any application
        return in_array($user->role, ['admin', 'staff']);
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // All authenticated users can create applications
        return true;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, BeneficiaryApplication $application): bool
    {
        // Users can only update their own applications if status allows
        if ($application->beneficiary->citizen_id == $user->id && $application->application_status === 'submitted') {
            return true;
        }

        // Admins, staff, and superadmins can update any application
        return in_array($user->role, ['admin', 'staff', 'superadmin']);
    }

    /**
     * Determine whether the user can update the status of the model.
     */
    public function updateStatus(User $user, BeneficiaryApplication $application): bool
    {
        // Only admins, staff, and superadmins can update status
        return in_array($user->role, ['admin', 'staff', 'superadmin']);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, BeneficiaryApplication $application): bool
    {
        // Users can only delete their own applications if status allows
        if ($application->beneficiary->citizen_id == $user->id && $application->application_status === 'submitted') {
            return true;
        }

        // Admins, staff, and superadmins can delete any application
        return in_array($user->role, ['admin', 'staff', 'superadmin']);
    }

    /**
     * Determine whether the user can upload documents to the application.
     */
    public function uploadDocuments(User $user, BeneficiaryApplication $application): bool
    {
        // Users can upload documents to their own applications
        if ($application->beneficiary->citizen_id == $user->id) {
            return true;
        }

        // Admins, staff, and superadmins can upload documents to any application
        return in_array($user->role, ['admin', 'staff', 'superadmin']);
    }

    /**
     * Determine whether the user can replace documents in the application.
     */
    public function replaceDocument(User $user, BeneficiaryApplication $application): bool
    {
        // Users can replace documents in their own applications
        if ($application->beneficiary->citizen_id == $user->id) {
            return true;
        }

        // Admins, staff, and superadmins can replace documents in any application
        return in_array($user->role, ['admin', 'staff', 'superadmin']);
    }

    /**
     * Determine whether the user can schedule site visits.
     */
    public function scheduleSiteVisit(User $user, BeneficiaryApplication $application): bool
    {
        return in_array($user->role, ['staff', 'admin']);
    }

    /**
     * Determine whether the user can propose allocations.
     */
    public function proposeAllocation(User $user, BeneficiaryApplication $application): bool
    {
        return in_array($user->role, ['staff', 'admin']);
    }

    /**
     * Determine whether the user can validate the application.
     */
    public function validate(User $user, BeneficiaryApplication $application): bool
    {
        // Only admins, staff, and superadmins can validate applications
        return in_array($user->role, ['admin', 'staff', 'superadmin']);
    }

    /**
     * Determine whether the user can check eligibility of the application.
     */
    public function checkEligibility(User $user, BeneficiaryApplication $application): bool
    {
        // Only admins, staff, and superadmins can check eligibility
        return in_array($user->role, ['admin', 'staff', 'superadmin']);
    }

    /**
     * Determine whether the user can assign a case officer to the application.
     */
    public function assignCaseOfficer(User $user, BeneficiaryApplication $application): bool
    {
        // Housing officers, social workers, admins, and staff can assign case officers
        return in_array($user->role, ['admin', 'staff', 'superadmin', 'housing_officer', 'social_worker']);
    }

    /**
     * Determine whether the user can approve awards for the application.
     */
    public function approveAward(User $user, BeneficiaryApplication $application): bool
    {
        // Only admins, committee members, and superadmins can approve awards
        return in_array($user->role, ['admin', 'superadmin', 'committee_member']);
    }

    /**
     * Determine whether the user can generate awards for the application.
     */
    public function generateAward(User $user, BeneficiaryApplication $application): bool
    {
        // Housing officers, admins, and staff can generate awards
        return in_array($user->role, ['admin', 'staff', 'superadmin', 'housing_officer']);
    }
}
