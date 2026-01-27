import { useEffect, useState } from 'react';
import AdminContentCard from './AdminContentCard';
import { Users, TrendingUp, TrendingDown, Circle } from 'lucide-react';

interface EntryExitEvent {
    id: number;
    type: 'entry' | 'exit';
    person_id: number;
    timestamp: string;
    device_id: string | null;
}

interface OccupancyStats {
    current_occupancy: number;
    max_occupancy: number;
    events: EntryExitEvent[];
}

interface OccupancyDashboardProps {
    buildingId?: number;
}

export default function OccupancyDashboard({ buildingId }: OccupancyDashboardProps) {
    const [stats, setStats] = useState<OccupancyStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const url = buildingId
                    ? `/api/occupancy/stats?building_id=${buildingId}`
                    : '/api/occupancy/stats';
                const response = await fetch(url, {
                    headers: {
                        'Accept': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch occupancy stats');
                }

                const result = await response.json();
                if (result.success) {
                    setStats(result.data);
                } else {
                    throw new Error(result.message || 'Failed to fetch stats');
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();

        // Set up Laravel Echo listener
        const setupEcho = () => {
            if (window.Echo) {
                const channel = window.Echo.channel('occupancy-dashboard');

                channel.listen('.entry-exit-event', (data: {
                    event: EntryExitEvent;
                    occupancy: {
                        current: number;
                        max: number;
                    };
                }) => {
                    // Update occupancy stats
                    setStats((prev) => {
                        if (!prev) {
                            return null;
                        }

                        // Add new event to the beginning of the list
                        const newEvents = [data.event, ...prev.events.slice(0, 14)];

                        return {
                            current_occupancy: data.occupancy.current,
                            max_occupancy: data.occupancy.max,
                            events: newEvents,
                        };
                    });
                });

                return () => {
                    window.Echo?.leave('occupancy-dashboard');
                };
            }
        };

        // Try to set up Echo immediately, or wait a bit if it's not ready
        const cleanup = setupEcho();
        if (!cleanup) {
            const timeout = setTimeout(() => {
                setupEcho();
            }, 100);

            return () => {
                clearTimeout(timeout);
                window.Echo?.leave('occupancy-dashboard');
            };
        }

        return cleanup;
    }, [buildingId]);

    const getStatusColor = (): 'green' | 'yellow' | 'red' => {
        if (!stats || stats.max_occupancy === 0) {
            return 'green';
        }

        const percentage = (stats.current_occupancy / stats.max_occupancy) * 100;

        if (percentage >= 90) {
            return 'red';
        } else if (percentage >= 70) {
            return 'yellow';
        }

        return 'green';
    };

    const getStatusText = (): string => {
        if (!stats || stats.max_occupancy === 0) {
            return 'Normal';
        }

        const percentage = (stats.current_occupancy / stats.max_occupancy) * 100;

        if (percentage >= 90) {
            return 'Critical';
        } else if (percentage >= 70) {
            return 'Warning';
        }

        return 'Normal';
    };

    const formatTimestamp = (timestamp: string): string => {
        const date = new Date(timestamp);
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        }).format(date);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <AdminContentCard>
                <div className="text-center py-8">
                    <p className="text-red-600 dark:text-red-400">{error}</p>
                </div>
            </AdminContentCard>
        );
    }

    if (!stats) {
        return null;
    }

    const statusColor = getStatusColor();
    const statusText = getStatusText();
    const percentage = stats.max_occupancy > 0
        ? Math.round((stats.current_occupancy / stats.max_occupancy) * 100)
        : 0;

    const statusColors = {
        green: {
            bg: 'bg-green-100 dark:bg-green-900/30',
            text: 'text-green-800 dark:text-green-300',
            dot: 'bg-green-500',
            border: 'border-green-500',
        },
        yellow: {
            bg: 'bg-yellow-100 dark:bg-yellow-900/30',
            text: 'text-yellow-800 dark:text-yellow-300',
            dot: 'bg-yellow-500',
            border: 'border-yellow-500',
        },
        red: {
            bg: 'bg-red-100 dark:bg-red-900/30',
            text: 'text-red-800 dark:text-red-300',
            dot: 'bg-red-500',
            border: 'border-red-500',
        },
    };

    const colors = statusColors[statusColor];

    return (
        <div className="space-y-6">
            {/* Occupancy Stats Card */}
            <AdminContentCard>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Current Occupancy
                    </h2>
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${colors.bg} ${colors.text}`}>
                        <Circle className={`w-2 h-2 ${colors.dot}`} fill="currentColor" />
                        <span className="text-sm font-medium">{statusText}</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2">
                            <Users className="w-5 h-5" />
                            <span className="text-sm">Current</span>
                        </div>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">
                            {stats.current_occupancy}
                        </p>
                    </div>

                    <div>
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2">
                            <Users className="w-5 h-5" />
                            <span className="text-sm">Maximum</span>
                        </div>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">
                            {stats.max_occupancy}
                        </p>
                    </div>

                    <div>
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2">
                            {percentage >= 70 ? (
                                <TrendingUp className="w-5 h-5" />
                            ) : (
                                <TrendingDown className="w-5 h-5" />
                            )}
                            <span className="text-sm">Capacity</span>
                        </div>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">
                            {percentage}%
                        </p>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-6">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                        <div
                            className={`h-3 rounded-full transition-all duration-300 ${colors.bg.replace('100', '500').replace('900/30', '500')}`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                    </div>
                </div>
            </AdminContentCard>

            {/* Recent Events Card */}
            <AdminContentCard>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Recent Entry/Exit Events
                </h2>

                {stats.events.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                        No events recorded yet
                    </p>
                ) : (
                    <div className="space-y-3">
                        {stats.events.map((event) => (
                            <div
                                key={event.id}
                                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                            >
                                <div className="flex items-center gap-3">
                                    {event.type === 'entry' ? (
                                        <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                                    ) : (
                                        <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
                                    )}
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            Person #{event.person_id} - {event.type === 'entry' ? 'Entered' : 'Exited'}
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {formatTimestamp(event.timestamp)}
                                            {event.device_id && ` • Device: ${event.device_id}`}
                                        </p>
                                    </div>
                                </div>
                                <span
                                    className={`px-2 py-1 text-xs font-medium rounded ${
                                        event.type === 'entry'
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                    }`}
                                >
                                    {event.type.toUpperCase()}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </AdminContentCard>
        </div>
    );
}
