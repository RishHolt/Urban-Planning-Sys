<?php

use App\Http\Controllers\Admin\AdminAuditLogController;
use App\Http\Controllers\Admin\AdminZoningApplicationController;
use App\Http\Controllers\Admin\ClupController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\LogoutController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ZoningApplicationController;
use App\Http\Middleware\RedirectByRole;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    $user = Auth::user();

    if ($user) {
        $role = $user->role ?? 'user';

        // Redirect admin, staff, and superadmin to admin page
        if (in_array($role, ['admin', 'staff', 'superadmin'])) {
            return redirect()->route('admin.home');
        }

        // Redirect regular users to user page
        return redirect()->route('user.home');
    }

    return Inertia::render('User/Home');
})->name('home');

// Authentication routes
Route::middleware('guest')->group(function () {
    Route::get('/login', [LoginController::class, 'create'])->name('login');
    Route::post('/login', [LoginController::class, 'store']);
});

// Logout route - needs auth but not RedirectByRole
Route::middleware('auth')->group(function () {
    Route::post('/logout', [LogoutController::class, 'destroy'])->name('logout');
    Route::get('/profile', [ProfileController::class, 'show'])->name('profile');
    Route::put('/profile', [ProfileController::class, 'update'])->name('profile.update');

    // Zoning Application routes
    Route::prefix('applications/zoning')->name('applications.zoning.')->group(function () {
        Route::get('/', [ZoningApplicationController::class, 'index'])->name('index');
        Route::get('/create', [ZoningApplicationController::class, 'create'])->name('create');
        Route::post('/', [ZoningApplicationController::class, 'store'])->name('store');
        Route::get('/success', function (Request $request) {
            return Inertia::render('Applications/ZoningApplicationSuccess', [
                'applicationNumber' => $request->query('applicationNumber', ''),
            ]);
        })->name('success');
        Route::get('/{id}', [ZoningApplicationController::class, 'show'])->name('show');
        Route::post('/{id}/documents', [ZoningApplicationController::class, 'uploadDocuments'])->name('uploadDocuments');
        Route::post('/{id}/documents/{documentId}/replace', [ZoningApplicationController::class, 'replaceDocument'])->name('replaceDocument');
        Route::get('/{id}/documents/{documentId}/versions', [ZoningApplicationController::class, 'getDocumentVersions'])->name('getDocumentVersions');
    });
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

            Route::prefix('applications')->name('applications.')->group(function () {
                Route::get('/', [AdminZoningApplicationController::class, 'index'])->name('index');
                Route::get('/{id}', [AdminZoningApplicationController::class, 'show'])->name('show');
                Route::patch('/{id}/status', [AdminZoningApplicationController::class, 'updateStatus'])->name('updateStatus');
                Route::patch('/{id}/documents/{documentId}/approve', [AdminZoningApplicationController::class, 'approveDocument'])->name('documents.approve');
                Route::patch('/{id}/documents/{documentId}/reject', [AdminZoningApplicationController::class, 'rejectDocument'])->name('documents.reject');
                Route::get('/{id}/documents/{documentId}/versions', [AdminZoningApplicationController::class, 'getDocumentVersions'])->name('documents.versions');
            });

            Route::prefix('clup')->name('clup.')->group(function () {
                Route::get('/', [ClupController::class, 'index'])->name('index');
                Route::get('/create', [ClupController::class, 'create'])->name('create');
                Route::post('/', [ClupController::class, 'store'])->name('store');
                Route::get('/{id}', [ClupController::class, 'show'])->name('show');
                Route::get('/{id}/edit', [ClupController::class, 'edit'])->name('edit');
                Route::patch('/{id}', [ClupController::class, 'update'])->name('update');
                Route::delete('/{id}', [ClupController::class, 'destroy'])->name('destroy');

                // Zoning Classifications
                Route::get('/{clupId}/classifications', [ClupController::class, 'getClassifications'])->name('classifications.index');
                Route::post('/classifications', [ClupController::class, 'storeClassification'])->name('classifications.store');
                Route::patch('/classifications/{id}', [ClupController::class, 'updateClassification'])->name('classifications.update');
                Route::delete('/classifications/{id}', [ClupController::class, 'destroyClassification'])->name('classifications.destroy');

                // GIS Polygons
                Route::get('/{clupId}/polygons', [ClupController::class, 'getAllPolygonsForClup'])->name('polygons.all');
                Route::get('/classifications/{zoningId}/polygons', [ClupController::class, 'getPolygons'])->name('polygons.index');
                Route::post('/polygons', [ClupController::class, 'storePolygon'])->name('polygons.store');
                Route::patch('/polygons/{id}', [ClupController::class, 'updatePolygon'])->name('polygons.update');
                Route::delete('/polygons/{id}', [ClupController::class, 'destroyPolygon'])->name('polygons.destroy');
            });
        });

        Route::get('/audit-logs', [AdminAuditLogController::class, 'index'])->name('audit-logs.index');

        Route::get('/reports', function () {
            return Inertia::render('Admin/Reports');
        })->name('reports');
    });
});
