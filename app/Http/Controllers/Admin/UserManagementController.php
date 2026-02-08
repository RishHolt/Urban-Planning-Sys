<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreUserRequest;
use App\Http\Requests\Admin\UpdateUserRequest;
use App\Models\AuditLog;
use App\Models\Role;
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
        $query = User::with('roles.modules', 'profile');

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

        // Filter by role
        if ($request->has('role') && $request->role) {
            $query->where('role', $request->role);
        }

        // Filter by dynamic role
        if ($request->has('role_id') && $request->role_id) {
            $query->whereHas('roles', function ($roleQuery) use ($request) {
                $roleQuery->where('roles.id', $request->role_id);
            });
        }

        // Filter by module access
        if ($request->has('module_code') && $request->module_code) {
            $query->where(function ($q) use ($request) {
                $q->whereIn('role', ['super_admin', 'admin', 'staff'])
                    ->orWhereHas('roles.modules', function ($moduleQuery) use ($request) {
                        $moduleQuery->where('code', $request->module_code);
                    });
            });
        }

        // Filter by status
        if ($request->has('status') && $request->status !== null) {
            $query->where('is_active', $request->status === 'active');
        }

        $users = $query->orderBy('created_at', 'desc')
            ->paginate(15);

        $roles = Role::orderBy('name')->get();

        return Inertia::render('Admin/UserManagement/UsersIndex', [
            'users' => $users,
            'roles' => $roles,
            'filters' => [
                'search' => $request->search,
                'role' => $request->role,
                'role_id' => $request->role_id,
                'module_code' => $request->module_code,
                'status' => $request->status,
            ],
        ]);
    }

    /**
     * Show the form for creating a new user.
     */
    public function create(): Response
    {
        $roles = Role::orderBy('name')->get();

        return Inertia::render('Admin/UserManagement/UserCreate', [
            'roles' => $roles,
        ]);
    }

    /**
     * Store a newly created user.
     */
    public function store(StoreUserRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $roleIds = $data['role_ids'] ?? [];

        unset($data['role_ids']);

        $user = $this->userService->createUser($data, $roleIds);

        // Log to system logs
        AuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'user_created',
            'resource_type' => 'user',
            'resource_id' => (string) $user->id,
            'changes' => [
                'email' => $user->email,
                'role' => $user->role,
                'role_ids' => $roleIds,
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
        $user = User::with(['roles.modules', 'profile'])->findOrFail($id);

        return Inertia::render('Admin/UserManagement/UserShow', [
            'user' => $user,
        ]);
    }

    /**
     * Show the form for editing the specified user.
     */
    public function edit(string $id): Response
    {
        $user = User::with('roles')->findOrFail($id);
        $roles = Role::orderBy('name')->get();

        return Inertia::render('Admin/UserManagement/UserEdit', [
            'user' => $user,
            'roles' => $roles,
        ]);
    }

    /**
     * Update the specified user.
     */
    public function update(UpdateUserRequest $request, string $id): RedirectResponse
    {
        $user = User::with('roles')->findOrFail($id);
        $oldData = [
            'email' => $user->email,
            'role' => $user->role,
            'is_active' => $user->is_active,
            'role_ids' => $user->roles->pluck('id')->toArray(),
        ];

        $data = $request->validated();
        $roleIds = $data['role_ids'] ?? [];

        unset($data['role_ids']);

        $this->userService->updateUser($user, $data, $roleIds);

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
                    'role_ids' => $roleIds,
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
        $user = User::with('roles')->findOrFail($id);
        $userData = [
            'email' => $user->email,
            'role' => $user->role,
            'is_active' => $user->is_active,
            'role_ids' => $user->roles->pluck('id')->toArray(),
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
