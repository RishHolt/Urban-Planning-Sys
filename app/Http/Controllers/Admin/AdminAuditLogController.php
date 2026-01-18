<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminAuditLogController extends Controller
{
    /**
     * Display a listing of audit logs.
     */
    public function index(Request $request): Response
    {
        $query = AuditLog::query();

        // Search functionality
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('action', 'like', "%{$search}%")
                    ->orWhere('resource_type', 'like', "%{$search}%")
                    ->orWhere('resource_id', 'like', "%{$search}%");
            });
        }

        // Filter by action type
        if ($request->has('actionType') && $request->actionType) {
            $query->where('action', $request->actionType);
        }

        // Filter by resource type
        if ($request->has('resourceType') && $request->resourceType) {
            $query->where('resource_type', $request->resourceType);
        }

        // Filter by user
        if ($request->has('userId') && $request->userId) {
            $query->where('user_id', $request->userId);
        }

        // Date range filter
        if ($request->has('dateFrom') && $request->dateFrom) {
            $query->whereDate('created_at', '>=', $request->dateFrom);
        }
        if ($request->has('dateTo') && $request->dateTo) {
            $query->whereDate('created_at', '<=', $request->dateTo);
        }

        $logs = $query->orderBy('created_at', 'desc')
            ->paginate($request->get('perPage', 15))
            ->through(function ($log) {
                return [
                    'id' => (string) $log->id,
                    'userId' => $log->user_id,
                    'action' => $log->action,
                    'resourceType' => $log->resource_type,
                    'resourceId' => $log->resource_id,
                    'changes' => $log->changes,
                    'ipAddress' => $log->ip_address,
                    'userAgent' => $log->user_agent,
                    'createdAt' => $log->created_at?->format('Y-m-d H:i:s'),
                ];
            });

        return Inertia::render('Admin/AuditLogs', [
            'logs' => $logs,
            'filters' => $request->only(['search', 'actionType', 'resourceType', 'userId', 'dateFrom', 'dateTo']),
        ]);
    }
}
