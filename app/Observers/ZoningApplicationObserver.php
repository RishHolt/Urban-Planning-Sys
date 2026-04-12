<?php

namespace App\Observers;

use App\Models\ApplicationHistory;
use App\Models\ZoningApplication;
use Illuminate\Support\Facades\Auth;

class ZoningApplicationObserver
{
    /**
     * Handle the ZoningApplication "created" event.
     */
    public function created(ZoningApplication $zoningApplication): void
    {
        ApplicationHistory::create([
            'application_id' => $zoningApplication->id,
            'event_type' => 'created',
            'status' => 'pending',
            'remarks' => 'Application submitted and initialized.',
            'updated_by' => Auth::id() ?? $zoningApplication->user_id,
            'updated_at' => now(),
        ]);
    }

    /**
     * Handle the ZoningApplication "updated" event.
     */
    public function updated(ZoningApplication $zoningApplication): void
    {
        // Only log general updates if something other than status changed
        // Status changes are usually handled manually with specific notes in controllers
        $changes = $zoningApplication->getChanges();

        // Remove status and system timestamps from changes check
        unset($changes['status'], $changes['updated_at'], $changes['processed_at'], $changes['reviewed_at'], $changes['approved_at']);

        if (! empty($changes)) {
            ApplicationHistory::create([
                'application_id' => $zoningApplication->id,
                'event_type' => 'updated',
                'status' => $zoningApplication->status,
                'remarks' => 'Application information updated.',
                'updated_by' => Auth::id() ?? $zoningApplication->user_id, // Fallback to applicant if no auth user
                'updated_at' => now(),
            ]);
        }
    }
}
