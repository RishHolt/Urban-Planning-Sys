<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Module;
use App\Models\Role;
use Illuminate\Http\JsonResponse;

class ModuleAccessController extends Controller
{
    /**
     * Get all modules.
     */
    public function getModules(): JsonResponse
    {
        $modules = Module::where('is_active', true)
            ->orderBy('name')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $modules,
        ]);
    }

    /**
     * Get modules for a specific role.
     */
    public function getRoleModules(string $roleId): JsonResponse
    {
        $role = Role::with('modules')->findOrFail($roleId);

        return response()->json([
            'success' => true,
            'data' => $role->modules,
        ]);
    }
}
