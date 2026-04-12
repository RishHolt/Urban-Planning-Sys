<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreUserRequest;
use App\Http\Requests\Admin\UpdateUserRequest;
use App\Models\AuditLog;
use App\Models\User;
use App\Services\UserManagementService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserManagementController extends Controller
{
    public function __construct(
        protected UserManagementService $userService
    ) {}

    /**
     * Display a listing of users.
     */
    public function index(Request $request): Response
    {
        $query = User::with('profile');

        // Search functionality
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('email', 'like', "%{$search}%")
                    ->orWhereHas('profile', function ($profileQuery) use ($search) {
                        $profileQuery->where('first_name', 'like', "%{$search}%")
                            ->orWhere('last_name', 'like', "%{$search}%");
                    });
            });
        }

        // Filter by type (Citizens vs Staff)
        $type = $request->get('type', 'citizen');
        if ($type === 'citizen') {
            $query->where('role', 'user');
        } elseif ($type === 'staff') {
            $query->whereIn('role', ['staff', 'admin', 'super_admin', 'official']); // Including official if it exists
        }

        // Filter by role (within the type)
        if ($request->has('role') && $request->role) {
            $query->where('role', $request->role);
        }

        // Filter by status
        if ($request->has('status') && $request->status !== null) {
            $query->where('is_active', $request->status === 'active');
        }

        $users = $query->orderBy('created_at', 'desc')
            ->paginate(15);

        return Inertia::render('Admin/UserManagement/UsersIndex', [
            'users' => $users,
            'filters' => [
                'search' => $request->search,
                'role' => $request->role,
                'status' => $request->status,
                'type' => $type,
            ],
        ]);
    }

    /**
     * Show the form for creating a new user.
     */
    public function create(): Response
    {
        return Inertia::render('Admin/UserManagement/UserCreate');
    }

    /**
     * Store a newly created user.
     */
    public function store(StoreUserRequest $request): RedirectResponse
    {
        $data = $request->validated();

        $user = $this->userService->createUser($data);

        // Log to system logs
        AuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'user_created',
            'resource_type' => 'user',
            'resource_id' => (string) $user->id,
            'changes' => [
                'email' => $user->email,
                'role' => $user->role,
                'is_active' => $user->is_active,
            ],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return redirect()->route('admin.user-management.show', $user->id)
            ->with('success', 'User created successfully.');
    }

    /**
     * Display the specified user.
     */
    public function show(string $id): Response
    {
        $user = User::with('profile')->findOrFail($id);

        return Inertia::render('Admin/UserManagement/UserShow', [
            'user' => $user,
        ]);
    }

    /**
     * Show the form for editing the specified user.
     */
    public function edit(string $id): Response
    {
        $user = User::with('profile')->findOrFail($id);

        return Inertia::render('Admin/UserManagement/UserEdit', [
            'user' => $user,
        ]);
    }

    /**
     * Update the specified user.
     */
    public function update(UpdateUserRequest $request, string $id): RedirectResponse
    {
        $user = User::findOrFail($id);
        $oldData = [
            'email' => $user->email,
            'role' => $user->role,
            'is_active' => $user->is_active,
        ];

        $data = $request->validated();

        $this->userService->updateUser($user, $data);

        $user->refresh();

        // Log to system logs
        AuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'user_updated',
            'resource_type' => 'user',
            'resource_id' => (string) $user->id,
            'changes' => [
                'old' => $oldData,
                'new' => [
                    'email' => $user->email,
                    'role' => $user->role,
                    'is_active' => $user->is_active,
                ],
            ],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return redirect()->route('admin.user-management.show', $user->id)
            ->with('success', 'User updated successfully.');
    }

    /**
     * Remove the specified user.
     */
    public function destroy(string $id): RedirectResponse
    {
        $user = User::findOrFail($id);
        $userData = [
            'email' => $user->email,
            'role' => $user->role,
            'is_active' => $user->is_active,
        ];

        $user->delete();

        // Log to system logs
        AuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'user_deleted',
            'resource_type' => 'user',
            'resource_id' => (string) $id,
            'changes' => $userData,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);

        return redirect()->route('admin.user-management.index')
            ->with('success', 'User deleted successfully.');
    }

    /**
     * Toggle the active status of the specified user.
     */
    public function toggleActive(string $id): RedirectResponse
    {
        $user = User::findOrFail($id);
        $oldStatus = $user->is_active;
        $user->is_active = ! $user->is_active;
        $user->save();

        $status = $user->is_active ? 'activated' : 'deactivated';

        // Log to system logs
        AuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'user_status_toggled',
            'resource_type' => 'user',
            'resource_id' => (string) $user->id,
            'changes' => [
                'email' => $user->email,
                'status_from' => $oldStatus ? 'active' : 'inactive',
                'status_to' => $user->is_active ? 'active' : 'inactive',
            ],
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);

        return redirect()->back()
            ->with('success', "User {$status} successfully.");
    }
}
