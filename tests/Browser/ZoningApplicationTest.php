<?php

namespace Tests\Browser;

use App\Models\User;
use Laravel\Dusk\Browser;
use Tests\DuskTestCase;
use Throwable;

class ZoningApplicationTest extends DuskTestCase
{
    /**
     * Test the zoning clearance application flow.
     *
     * @throws Throwable
     */
    public function test_zoning_clearance_application_flow(): void
    {
        $this->browse(function (Browser $browser) {
            $browser->visit('/_dusk/login/3')
                ->visit('/zoning-applications/create')
                ->waitForText('Zoning Clearance Application')
                
                // Step 1: Applicant Information
                ->type('tax_dec_ref_no', 'TD-2024-001')
                ->type('barangay_permit_ref_no', 'BP-2024-056')
                ->waitForText('Verified in Treasury records', 10)
                ->waitForText('Verified Barangay Permit', 10)
                ->type('lot_owner', 'Juan Dela Cruz')
                ->type('contact_number', '09123456789')
                ->click('#next_button')
                
                // Step 2: Location & Project Info
                ->waitForText('Phase 2: Location & Project Info')
                ->type('lot_address', '123 Test Street, Manila')
                ->select('land_use_type', 'residential')
                ->select('project_type', 'new_construction')
                ->type('building_type', 'Single-detached House')
                
                // Set zone_id via the sr-only input
                ->waitFor('#zone_id_input')
                ->type('#zone_id_input', '2')
                // Wait for any potential auto-calculations or state updates
                ->pause(1000)
                ->click('#next_button')
                
                // Step 3: Project Details
                ->waitForText('Phase 3: Project Details')
                ->type('lot_area_total', '200')
                ->type('lot_area_used', '150')
                ->type('project_description', 'Building a new two-storey house.')
                ->type('purpose', 'Residential purposes.')
                ->click('#next_button')
                
                // Step 4: Document Details
                ->waitForText('Phase 4: Document Requirements')
                ->click('#next_button')
                
                // Step 5: Fee Assessment
                ->waitForText('Fee Assessment')
                ->waitForText('Total Fee', 15)
                ->click('#next_button')
                
                // Step 6: Review & Submit
                ->waitForText('Review & Submit')
                ->pause(1000)
                ->click('#submit_button')
                
                // Success
                ->waitForLocation('/zoning-applications', 20)
                ->assertSee('Application submitted successfully');
        });
    }
}
