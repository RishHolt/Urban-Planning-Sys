<?php

use App\Http\Controllers\Admin\AdminAuditLogController;
use App\Http\Controllers\Admin\AdminHousingBeneficiaryController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\LogoutController;
use App\Http\Controllers\Auth\OtpVerificationController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\HousingBeneficiaryController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ProfileController;
use App\Http\Middleware\RedirectByRole;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    $user = Auth::user();

    if ($user) {
        $role = $user->role ?? 'citizen';

        // Redirect admin and staff to admin page
        if (in_array($role, ['admin', 'staff'])) {
            return redirect()->route('admin.home');
        }

        // Redirect regular users to user page
        return redirect()->route('user.home');
    }

    return Inertia::render('User/Home');
})->name('home');

// Authentication routes
Route::middleware('guest')->group(function () {
    // Registration
    Route::post('/register', [RegisterController::class, 'store'])->name('register');

    // OTP Verification
    Route::get('/verify-otp', [OtpVerificationController::class, 'show'])->name('verify-otp.show');
    Route::post('/verify-otp', [OtpVerificationController::class, 'verify'])->name('verify-otp.verify');
    Route::post('/resend-otp', [OtpVerificationController::class, 'resend'])->name('otp.resend');
    Route::get('/api/otp/{email}', [OtpVerificationController::class, 'getOtp'])->name('otp.get');

    // Login
    Route::get('/login', [LoginController::class, 'create'])->name('login');
    Route::post('/login', [LoginController::class, 'store']);
    Route::post('/login/resend-otp', [LoginController::class, 'resendOtp'])->name('login.resend-otp');
});

// Logout route - needs auth but not RedirectByRole
Route::middleware('auth')->group(function () {
    Route::post('/logout', [LogoutController::class, 'destroy'])->name('logout');
    Route::get('/profile', [ProfileController::class, 'show'])->name('profile');
    Route::put('/profile', [ProfileController::class, 'update'])->name('profile.update');

    // Zoning Application routes (new ERD-based system)
    Route::prefix('zoning-applications')->name('zoning-applications.')->group(function () {
        Route::get('/', [\App\Http\Controllers\ZoningApplicationController::class, 'index'])->name('index');
        Route::get('/create', [\App\Http\Controllers\ZoningApplicationController::class, 'create'])->name('create');
        Route::get('/new', [\App\Http\Controllers\ZoningApplicationController::class, 'create'])->name('new');
        Route::post('/', [\App\Http\Controllers\ZoningApplicationController::class, 'store'])->name('store');
        Route::post('/assess-fees', [\App\Http\Controllers\ZoningApplicationController::class, 'assessFees'])->name('assess-fees');
        Route::get('/{id}', [\App\Http\Controllers\ZoningApplicationController::class, 'show'])->name('show');

        // Document management routes
        Route::post('/{id}/documents', [\App\Http\Controllers\ZoningApplicationDocumentController::class, 'store'])->name('documents.store');
        Route::patch('/{id}/documents/{documentId}/status', [\App\Http\Controllers\ZoningApplicationDocumentController::class, 'updateStatus'])->name('documents.update-status');
        Route::get('/{id}/documents/{documentId}/download', [\App\Http\Controllers\ZoningApplicationDocumentController::class, 'download'])->name('documents.download');
    });

    // Subdivision Application routes (for developers)
    Route::prefix('subdivision-applications')->name('subdivision-applications.')->group(function () {
        Route::get('/', [\App\Http\Controllers\SubdivisionApplicationController::class, 'index'])->name('index');
        Route::get('/create', [\App\Http\Controllers\SubdivisionApplicationController::class, 'create'])->name('create');
        Route::post('/', [\App\Http\Controllers\SubdivisionApplicationController::class, 'store'])->name('store');
        Route::get('/{id}', [\App\Http\Controllers\SubdivisionApplicationController::class, 'show'])->name('show');
    });

    // Zones API for frontend zone detection and map rendering
    Route::get('/api/zones', [\App\Http\Controllers\Admin\ZoneController::class, 'getAllZones'])->name('zones.all');

    // Prerequisite verification (before application submission)
    Route::post('/api/verify-prerequisites', [\App\Http\Controllers\PrerequisiteVerificationController::class, 'verify'])->name('prerequisites.verify');

    // Inspections routes (inspector and admin only)
    Route::prefix('inspections')->name('inspections.')->group(function () {
        Route::get('/', [\App\Http\Controllers\InspectionController::class, 'index'])->name('index');
        Route::get('/{id}', [\App\Http\Controllers\InspectionController::class, 'show'])->name('show');
        Route::post('/', [\App\Http\Controllers\InspectionController::class, 'store'])->name('store');
        Route::put('/{id}', [\App\Http\Controllers\InspectionController::class, 'update'])->name('update');
        Route::post('/{id}/review', [\App\Http\Controllers\InspectionController::class, 'review'])->name('review');
        Route::post('/{id}/checklist-items', [\App\Http\Controllers\InspectionController::class, 'addChecklistItem'])->name('checklist.add');
        Route::put('/{id}/checklist-items/{itemId}', [\App\Http\Controllers\InspectionController::class, 'updateChecklistItem'])->name('checklist.update');
        Route::post('/{id}/photos', [\App\Http\Controllers\InspectionController::class, 'uploadPhoto'])->name('photos.upload');
        Route::post('/{id}/documents', [\App\Http\Controllers\InspectionController::class, 'uploadDocument'])->name('documents.upload');
        Route::get('/{id}/report', [\App\Http\Controllers\InspectionController::class, 'generateReport'])->name('report');
    });

    // Issued Clearances routes (admin only)
    Route::prefix('clearances')->name('clearances.')->group(function () {
        Route::get('/', [\App\Http\Controllers\IssuedClearanceController::class, 'index'])->name('index');
        Route::get('/create', [\App\Http\Controllers\IssuedClearanceController::class, 'create'])->name('create');
        Route::post('/', [\App\Http\Controllers\IssuedClearanceController::class, 'store'])->name('store');
        Route::get('/{id}', [\App\Http\Controllers\IssuedClearanceController::class, 'show'])->name('show');
        Route::get('/{id}/view', [\App\Http\Controllers\IssuedClearanceController::class, 'view'])->name('view');
        Route::get('/{id}/download', [\App\Http\Controllers\IssuedClearanceController::class, 'download'])->name('download');
    });

    // Legacy Zoning Application routes - Redirect to New Zoning Application system
    Route::prefix('applications/zoning')->name('applications.zoning.')->group(function () {
        Route::get('/', function () {
            return redirect()->route('zoning-applications.index');
        })->name('index');
        Route::get('/create', function (Request $request) {
            return redirect()->route('zoning-applications.create');
        })->name('create');
        Route::post('/', function () {
            return redirect()->route('zoning-applications.index');
        })->name('store');
        Route::get('/success', function () {
            return redirect()->route('zoning-applications.index');
        })->name('success');
        Route::get('/{id}', function (string $id) {
            return redirect()->route('zoning-applications.show', $id);
        })->name('show');
        Route::post('/{id}/documents', function (string $id) {
            return redirect()->route('zoning-applications.show', $id);
        })->name('uploadDocuments');
        Route::post('/{id}/documents/{documentId}/replace', function (string $id) {
            return redirect()->route('zoning-applications.show', $id);
        })->name('replaceDocument');
        Route::get('/{id}/documents/{documentId}/versions', function (string $id) {
            return redirect()->route('zoning-applications.show', $id);
        })->name('getDocumentVersions');
    });

    // Housing Beneficiary Application routes
    Route::prefix('applications/housing')->name('applications.housing.')->group(function () {
        Route::get('/', [HousingBeneficiaryController::class, 'index'])->name('index');
        Route::get('/create', [HousingBeneficiaryController::class, 'create'])->name('create');
        Route::post('/', [HousingBeneficiaryController::class, 'store'])->name('store');
        Route::get('/success', function (Request $request) {
            return Inertia::render('Applications/Housing/ApplicationSuccess', [
                'applicationNumber' => $request->query('applicationNumber', ''),
            ]);
        })->name('success');
        Route::get('/{id}', [HousingBeneficiaryController::class, 'show'])->name('show');
        Route::put('/{id}', [HousingBeneficiaryController::class, 'update'])->name('update');
        Route::post('/{id}/documents', [HousingBeneficiaryController::class, 'uploadDocuments'])->name('uploadDocuments');
        Route::post('/{id}/documents/{documentId}/replace', [HousingBeneficiaryController::class, 'replaceDocument'])->name('replaceDocument');
    });

    // Complaints (for citizens)
    Route::prefix('complaints')->name('complaints.')->group(function () {
        Route::get('/', [\App\Http\Controllers\ComplaintController::class, 'index'])->name('index');
        Route::post('/', [\App\Http\Controllers\ComplaintController::class, 'store'])->name('store');
    });

    // Notification routes
    Route::prefix('notifications')->name('notifications.')->group(function () {
        Route::get('/', [NotificationController::class, 'index'])->name('index');
        Route::get('/unread-count', [NotificationController::class, 'unreadCount'])->name('unreadCount');
        Route::post('/{id}/read', [NotificationController::class, 'markAsRead'])->name('markAsRead');
        Route::post('/read-all', [NotificationController::class, 'markAllAsRead'])->name('markAllAsRead');
    });
});

// Public API routes (token authentication only, no session auth)
// Person Count Events API (simplified approach - tracks person count every second)
Route::middleware('api.token')->prefix('api/events')->name('api.events.')->group(function () {
    Route::post('person-count', [\App\Http\Controllers\EntryExitEventController::class, 'storePersonCount'])->name('person-count.store');
});

// Occupancy Dashboard API routes (protected with token authentication)
Route::middleware('api.token')->prefix('api/occupancy')->name('api.occupancy.')->group(function () {
    Route::get('stats', [\App\Http\Controllers\OccupancyDashboardController::class, 'stats'])->name('stats');
});

Route::middleware(['auth', RedirectByRole::class])->group(function () {
    Route::prefix('user')->name('user.')->group(function () {
        Route::get('/', function () {
            return Inertia::render('User/Home');
        })->name('home');
    });

    Route::prefix('admin')->name('admin.')->group(function () {
        Route::get('/', function () {
            return Inertia::render('Admin/Home');
        })->name('home');

        // Zoning Clearance routes
        Route::prefix('zoning')->name('zoning.')->group(function () {
            Route::get('/dashboard', function () {
                return Inertia::render('Admin/Zoning/Dashboard');
            })->name('dashboard');

            Route::get('/map', function () {
                return Inertia::render('Admin/Zoning/ZoningMap');
            })->name('map');

            // Zoning Applications (Clearance - matching user view)
            Route::prefix('applications')->name('applications.')->group(function () {
                Route::get('/', [\App\Http\Controllers\Admin\AdminZoningApplicationController::class, 'index'])->name('index');
                Route::get('/{id}', [\App\Http\Controllers\Admin\AdminZoningApplicationController::class, 'show'])->name('show');
                Route::patch('/{id}/status', [\App\Http\Controllers\Admin\AdminZoningApplicationController::class, 'updateStatus'])->name('updateStatus');
                Route::post('/{id}/request-documents', [\App\Http\Controllers\Admin\AdminZoningApplicationController::class, 'requestDocuments'])->name('requestDocuments');

                // Document Management
                Route::patch('/{id}/documents/{documentId}/approve', [\App\Http\Controllers\Admin\AdminZoningApplicationController::class, 'approveDocument'])->name('documents.approve');
                Route::patch('/{id}/documents/{documentId}/reject', [\App\Http\Controllers\Admin\AdminZoningApplicationController::class, 'rejectDocument'])->name('documents.reject');
                Route::get('/{id}/documents/{documentId}/versions', [\App\Http\Controllers\Admin\AdminZoningApplicationController::class, 'getDocumentVersions'])->name('documents.versions');
            });

            Route::prefix('zones')->name('zones.')->group(function () {
                Route::get('/', [\App\Http\Controllers\Admin\ZoneController::class, 'index'])->name('index');
                Route::post('/', [\App\Http\Controllers\Admin\ZoneController::class, 'store'])->name('store');
                Route::get('/export', [\App\Http\Controllers\Admin\ZoneController::class, 'exportGeoJson'])->name('export');
                Route::post('/import', [\App\Http\Controllers\Admin\ZoneController::class, 'importGeoJson'])->name('import');
                Route::post('/import-municipality', [\App\Http\Controllers\Admin\ZoneController::class, 'importMunicipality'])->name('import-municipality');
                Route::get('/{id}', [\App\Http\Controllers\Admin\ZoneController::class, 'show'])->name('show');
                Route::patch('/{id}', [\App\Http\Controllers\Admin\ZoneController::class, 'update'])->name('update');
                Route::delete('/{id}', [\App\Http\Controllers\Admin\ZoneController::class, 'destroy'])->name('destroy');
            });

            // Zoning Classification Management routes
            Route::prefix('classifications')->name('classifications.')->group(function () {
                Route::get('/', [\App\Http\Controllers\Admin\ZoningClassificationController::class, 'indexPage'])->name('index');
                Route::post('/', [\App\Http\Controllers\Admin\ZoningClassificationController::class, 'store'])->name('store');
                Route::get('/{id}', [\App\Http\Controllers\Admin\ZoningClassificationController::class, 'show'])->name('show');
                Route::patch('/{id}', [\App\Http\Controllers\Admin\ZoningClassificationController::class, 'update'])->name('update');
                Route::delete('/{id}', [\App\Http\Controllers\Admin\ZoningClassificationController::class, 'destroy'])->name('destroy');
            });

            // Zoning Classification API routes (for JSON responses)
            Route::prefix('api/classifications')->name('api.classifications.')->group(function () {
                Route::get('/', [\App\Http\Controllers\Admin\ZoningClassificationController::class, 'index'])->name('index');
            });
        });

        // Housing Beneficiary Registry routes
        Route::prefix('housing')->name('housing.')->group(function () {
            Route::get('/', function () {
                return Inertia::render('Admin/Housing/Dashboard');
            })->name('dashboard');

            Route::prefix('applications')->name('applications.')->group(function () {
                Route::get('/', [AdminHousingBeneficiaryController::class, 'index'])->name('index');
                Route::get('/{id}', [AdminHousingBeneficiaryController::class, 'show'])->name('show');
                Route::patch('/{id}/status', [AdminHousingBeneficiaryController::class, 'updateStatus'])->name('updateStatus');
                Route::post('/{id}/validate', [AdminHousingBeneficiaryController::class, 'validateApplication'])->name('validate');
                Route::post('/{id}/check-eligibility', [AdminHousingBeneficiaryController::class, 'checkEligibility'])->name('checkEligibility');
                Route::post('/{id}/request-documents', [AdminHousingBeneficiaryController::class, 'requestDocuments'])->name('requestDocuments');
                Route::patch('/{id}/documents/{documentId}/approve', [AdminHousingBeneficiaryController::class, 'approveDocument'])->name('documents.approve');
                Route::patch('/{id}/documents/{documentId}/reject', [AdminHousingBeneficiaryController::class, 'rejectDocument'])->name('documents.reject');
            });

            // Site Visits
            Route::prefix('site-visits')->name('site-visits.')->group(function () {
                Route::get('/', [\App\Http\Controllers\SiteVisitController::class, 'index'])->name('index');
                Route::post('/', [\App\Http\Controllers\SiteVisitController::class, 'store'])->name('store');
                Route::post('/{id}/complete', [\App\Http\Controllers\SiteVisitController::class, 'complete'])->name('complete');
            });

            // Housing Projects
            Route::prefix('projects')->name('projects.')->group(function () {
                Route::get('/', [\App\Http\Controllers\HousingProjectController::class, 'index'])->name('index');
                Route::post('/', [\App\Http\Controllers\HousingProjectController::class, 'store'])->name('store');
                Route::get('/{id}', [\App\Http\Controllers\HousingProjectController::class, 'show'])->name('show');
                Route::patch('/{id}', [\App\Http\Controllers\HousingProjectController::class, 'update'])->name('update');
            });

            // Housing Units
            Route::prefix('projects/{projectId}/units')->name('units.')->group(function () {
                Route::get('/', [\App\Http\Controllers\HousingUnitController::class, 'index'])->name('index');
                Route::post('/', [\App\Http\Controllers\HousingUnitController::class, 'store'])->name('store');
                Route::patch('/{id}', [\App\Http\Controllers\HousingUnitController::class, 'update'])->name('update');
            });

            // Waitlist
            Route::prefix('waitlist')->name('waitlist.')->group(function () {
                Route::get('/', [\App\Http\Controllers\WaitlistController::class, 'index'])->name('index');
                Route::get('/{id}', [\App\Http\Controllers\WaitlistController::class, 'show'])->name('show');
            });

            // Allocations
            Route::prefix('allocations')->name('allocations.')->group(function () {
                Route::get('/', [\App\Http\Controllers\AllocationController::class, 'index'])->name('index');
                Route::post('/', [\App\Http\Controllers\AllocationController::class, 'store'])->name('store');
                Route::post('/{id}/approve', [\App\Http\Controllers\AllocationController::class, 'approve'])->name('approve');
                Route::post('/{id}/reject', [\App\Http\Controllers\AllocationController::class, 'reject'])->name('reject');
                Route::post('/{id}/accept', [\App\Http\Controllers\AllocationController::class, 'accept'])->name('accept');
                Route::post('/{id}/decline', [\App\Http\Controllers\AllocationController::class, 'decline'])->name('decline');
                Route::post('/{id}/move-in', [\App\Http\Controllers\AllocationController::class, 'moveIn'])->name('moveIn');
            });

            // Complaints
            Route::prefix('complaints')->name('complaints.')->group(function () {
                Route::get('/', [\App\Http\Controllers\ComplaintController::class, 'index'])->name('index');
                Route::post('/', [\App\Http\Controllers\ComplaintController::class, 'store'])->name('store');
                Route::patch('/{id}/status', [\App\Http\Controllers\ComplaintController::class, 'updateStatus'])->name('updateStatus');
                Route::post('/{id}/assign', [\App\Http\Controllers\ComplaintController::class, 'assign'])->name('assign');
            });

            // Blacklist
            Route::prefix('blacklist')->name('blacklist.')->group(function () {
                Route::get('/', [\App\Http\Controllers\BlacklistController::class, 'index'])->name('index');
                Route::post('/', [\App\Http\Controllers\BlacklistController::class, 'store'])->name('store');
                Route::post('/{id}/lift', [\App\Http\Controllers\BlacklistController::class, 'lift'])->name('lift');
            });

            Route::prefix('beneficiaries')->name('beneficiaries.')->group(function () {
                Route::get('/', function () {
                    return Inertia::render('Admin/Housing/BeneficiariesIndex');
                })->name('index');
            });

            Route::get('/reports', function () {
                return Inertia::render('Admin/Housing/Reports');
            })->name('reports');
        });

        // Subdivision & Building Review routes
        Route::prefix('subdivision')->name('subdivision.')->group(function () {
            Route::get('/dashboard', function () {
                return Inertia::render('Admin/Subdivision/Dashboard');
            })->name('dashboard');

            Route::prefix('applications')->name('applications.')->group(function () {
                Route::get('/', [\App\Http\Controllers\Admin\AdminSubdivisionApplicationController::class, 'index'])->name('index');
                Route::get('/{id}', [\App\Http\Controllers\Admin\AdminSubdivisionApplicationController::class, 'show'])->name('show');
                Route::post('/{id}/review-stage', [\App\Http\Controllers\Admin\AdminSubdivisionApplicationController::class, 'reviewStage'])->name('reviewStage');
            });

            Route::prefix('certificates')->name('certificates.')->group(function () {
                Route::get('/', [\App\Http\Controllers\IssuedCertificateController::class, 'index'])->name('index');
                Route::get('/create', [\App\Http\Controllers\IssuedCertificateController::class, 'create'])->name('create');
                Route::post('/', [\App\Http\Controllers\IssuedCertificateController::class, 'store'])->name('store');
                Route::get('/{id}', [\App\Http\Controllers\IssuedCertificateController::class, 'show'])->name('show');
            });

            Route::get('/reports', function () {
                return Inertia::render('Admin/Subdivision/Reports');
            })->name('reports');
        });

        // Building Review routes
        Route::prefix('building')->name('building.')->group(function () {
            Route::prefix('reviews')->name('reviews.')->group(function () {
                Route::get('/', [\App\Http\Controllers\Admin\AdminBuildingReviewController::class, 'index'])->name('index');
                Route::get('/{id}', [\App\Http\Controllers\Admin\AdminBuildingReviewController::class, 'show'])->name('show');
                Route::post('/plan-checks', [\App\Http\Controllers\Admin\AdminBuildingReviewController::class, 'storePlanCheck'])->name('storePlanCheck');
                Route::post('/{id}/post-to-pl', [\App\Http\Controllers\Admin\AdminBuildingReviewController::class, 'postToPermitLicensing'])->name('postToPermitLicensing');
            });
        });

        // Occupancy Monitoring Tool routes
        Route::prefix('occupancy')->name('occupancy.')->group(function () {
            // Real-Time Dashboard
            Route::get('/dashboard', function () {
                return \Inertia\Inertia::render('Admin/Occupancy/OccupancyDashboard');
            })->name('dashboard');

            // Buildings
            Route::prefix('buildings')->name('buildings.')->group(function () {
                Route::get('/', [\App\Http\Controllers\Admin\Occupancy\BuildingController::class, 'index'])->name('index');
                Route::get('/create', [\App\Http\Controllers\Admin\Occupancy\BuildingController::class, 'create'])->name('create');
                Route::post('/', [\App\Http\Controllers\Admin\Occupancy\BuildingController::class, 'store'])->name('store');
                Route::get('/{id}', [\App\Http\Controllers\Admin\Occupancy\BuildingController::class, 'show'])->name('show');
                Route::get('/{id}/edit', [\App\Http\Controllers\Admin\Occupancy\BuildingController::class, 'edit'])->name('edit');
                Route::put('/{id}', [\App\Http\Controllers\Admin\Occupancy\BuildingController::class, 'update'])->name('update');
                Route::delete('/{id}', [\App\Http\Controllers\Admin\Occupancy\BuildingController::class, 'destroy'])->name('destroy');
            });

            // API routes for frontend
            Route::prefix('api')->name('api.')->group(function () {
                Route::get('/buildings/{id}/units', [\App\Http\Controllers\Admin\Occupancy\BuildingController::class, 'getUnits'])->name('buildings.units');
            });

            // Inspections
            Route::prefix('inspections')->name('inspections.')->group(function () {
                Route::get('/', [\App\Http\Controllers\Admin\Occupancy\OccupancyInspectionController::class, 'index'])->name('index');
                Route::get('/create', [\App\Http\Controllers\Admin\Occupancy\OccupancyInspectionController::class, 'create'])->name('create');
                Route::post('/', [\App\Http\Controllers\Admin\Occupancy\OccupancyInspectionController::class, 'store'])->name('store');
                Route::get('/{id}', [\App\Http\Controllers\Admin\Occupancy\OccupancyInspectionController::class, 'show'])->name('show');
                Route::put('/{id}', [\App\Http\Controllers\Admin\Occupancy\OccupancyInspectionController::class, 'update'])->name('update');
                Route::post('/{id}/complete', [\App\Http\Controllers\Admin\Occupancy\OccupancyInspectionController::class, 'complete'])->name('complete');
            });

            // Complaints
            Route::prefix('complaints')->name('complaints.')->group(function () {
                Route::get('/', [\App\Http\Controllers\Admin\Occupancy\OccupancyComplaintController::class, 'index'])->name('index');
                Route::get('/{id}', [\App\Http\Controllers\Admin\Occupancy\OccupancyComplaintController::class, 'show'])->name('show');
            });

            // Violations
            Route::prefix('violations')->name('violations.')->group(function () {
                Route::get('/', [\App\Http\Controllers\Admin\Occupancy\ViolationController::class, 'index'])->name('index');
                Route::get('/{id}', [\App\Http\Controllers\Admin\Occupancy\ViolationController::class, 'show'])->name('show');
            });

            // Compliance Reports
            Route::prefix('reports')->name('reports.')->group(function () {
                Route::get('/', [\App\Http\Controllers\Admin\Occupancy\ComplianceReportController::class, 'index'])->name('index');
                Route::get('/{id}', [\App\Http\Controllers\Admin\Occupancy\ComplianceReportController::class, 'show'])->name('show');
            });
        });

        // Infrastructure Project Coordination routes
        Route::prefix('infrastructure')->name('infrastructure.')->group(function () {
            Route::get('/dashboard', function () {
                return Inertia::render('Admin/Infrastructure/Dashboard');
            })->name('dashboard');

            Route::prefix('projects')->name('projects.')->group(function () {
                Route::get('/', [\App\Http\Controllers\Admin\InfrastructureProjectController::class, 'index'])->name('index');
                Route::get('/create', [\App\Http\Controllers\Admin\InfrastructureProjectController::class, 'create'])->name('create');
                Route::post('/', [\App\Http\Controllers\Admin\InfrastructureProjectController::class, 'store'])->name('store');
                Route::get('/{id}', [\App\Http\Controllers\Admin\InfrastructureProjectController::class, 'show'])->name('show');
                Route::get('/{id}/edit', [\App\Http\Controllers\Admin\InfrastructureProjectController::class, 'edit'])->name('edit');
                Route::put('/{id}', [\App\Http\Controllers\Admin\InfrastructureProjectController::class, 'update'])->name('update');
                Route::delete('/{id}', [\App\Http\Controllers\Admin\InfrastructureProjectController::class, 'destroy'])->name('destroy');
            });

            Route::get('/reports', function () {
                return Inertia::render('Admin/Infrastructure/Reports');
            })->name('reports');
        });

        Route::get('/audit-logs', [AdminAuditLogController::class, 'index'])->name('audit-logs.index');

        Route::get('/reports', function () {
            return Inertia::render('Admin/Reports');
        })->name('reports');
    });
});
