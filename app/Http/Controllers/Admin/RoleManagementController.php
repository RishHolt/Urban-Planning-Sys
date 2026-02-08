<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreRoleRequest;
use App\Http\Requests\Admin\UpdateRoleRequest;
use App\Models\AuditLog;
use App\Models\Module;
use App\Models\Role;
use App\Services\RoleManagementService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RoleManagementController extends Controller
{
    public function __construct(
        protected RoleManagementService $roleService
    ) {}

    /**
     * Display a listing of roles.
     */
    public function index(Request $request): Response
    {
        $query = Role::withCount('users')->with('modules');

        // Search functionality
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Filter by module
        if ($request->has('module_code') && $request->module_code) {
            $query->whereHas('modules', function ($moduleQuery) use ($request) {
                $moduleQuery->where('code', $request->module_code);
            });
        }

        $roles = $query->orderBy('name')->paginate(15);

        $modules = Module::where('is_active', true)->orderBy('name')->get();

        return Inertia::render('Admin/RoleManagement/RolesIndex', [
            'roles' => $roles,
            'modules' => $modules,
            'filters' => [
                'search' => $request->search,
                'module_code' => $request->module_code,
            ],
        ]);
    }

    /**
     * Show the form for creating a new role.
     */
    public function create(): Response
    {
        $modules = Module::where('is_active', true)->orderBy('name')->get();

        return Inertia::render('Admin/RoleManagement/RoleCreate', [
            'modules' => $modules,
        ]);
    }

    /**
     * Store a newly created role.
     */
    public function store(StoreRoleRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $moduleCodes = $data['module_codes'] ?? [];

        unset($data['module_codes']);

        $role = $this->roleService->createRole($data, $moduleCodes);

        // Log to system logs
        AuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'role_created',
            'resource_type' => 'role',
            'resource_id' => (string) $role->id,
            'changes' => [
                'name' => $role->name,
                'description' => $role->description,
                'module_codes' => $moduleCodes,
                'is_system' => $role->is_system,
            ],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return redirect()->route('admin.role-management.show', $role->id)
            ->with('success', 'Role created successfully.');
    }

    /**
     * Display the specified role.
     */
    public function show(string $id): Response
    {
        $role = Role::with(['modules', 'users'])->withCount('users')->findOrFail($id);

        return Inertia::render('Admin/RoleManagement/RoleShow', [
            'role' => $role,
        ]);
    }

    /**
     * Show the form for editing the specified role.
     */
    public function edit(string $id): Response
    {
        $role = Role::with('modules')->findOrFail($id);
        $modules = Module::where('is_active', true)->orderBy('name')->get();

        return Inertia::render('Admin/RoleManagement/RoleEdit', [
            'role' => $role,
            'modules' => $modules,
        ]);
    }

    /**
     * Update the specified role.
     */
    public function update(UpdateRoleRequest $request, string $id): RedirectResponse
    {
        $role = Role::with('modules')->findOrFail($id);

        // Prevent editing system roles
        if ($role->isSystem()) {
            return redirect()->back()
                ->with('error', 'System roles cannot be modified.');
        }

        $oldData = [
            'name' => $role->name,
            'description' => $role->description,
            'module_codes' => $role->modules->pluck('code')->toArray(),
        ];

        $data = $request->validated();
        $moduleCodes = $data['module_codes'] ?? [];

        unset($data['module_codes']);

        $this->roleService->updateRole($role, $data, $moduleCodes);

        $role->refresh();

        // Log to system logs
        AuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'role_updated',
            'resource_type' => 'role',
            'resource_id' => (string) $role->id,
            'changes' => [
                'old' => $oldData,
                'new' => [
                    'name' => $role->name,
                    'description' => $role->description,
                    'module_codes' => $moduleCodes,
                ],
            ],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return redirect()->route('admin.role-management.show', $role->id)
            ->with('success', 'Role updated successfully.');
    }

    /**
     * Remove the specified role.
     */
    public function destroy(string $id): RedirectResponse
    {
        $role = Role::with('modules')->findOrFail($id);

        if (! $this->roleService->canDeleteRole($role)) {
            return redirect()->back()
                ->with('error', 'This role cannot be deleted. It may be a system role or has assigned users.');
        }

        $roleData = [
            'name' => $role->name,
            'description' => $role->description,
            'module_codes' => $role->modules->pluck('code')->toArray(),
            'is_system' => $role->is_system,
        ];

        $role->delete();

        // Log to system logs
        AuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'role_deleted',
            'resource_type' => 'role',
            'resource_id' => (string) $id,
            'changes' => $roleData,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);

        return redirect()->route('admin.role-management.index')
            ->with('success', 'Role deleted successfully.');
    }
}
