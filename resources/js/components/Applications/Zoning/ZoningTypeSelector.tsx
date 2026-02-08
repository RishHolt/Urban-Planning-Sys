import { useState, useEffect } from 'react';
import { Zone } from '../../../lib/zoneDetection';
import { zoningTypeSuggestionService, ZoningSuggestion } from '../../../lib/ai/ZoningTypeSuggestionService';
import { Sparkles, Loader2, CheckCircle, Zap, TrendingUp } from 'lucide-react';
import Button from '../../Button';

interface ZoningTypeSelectorProps {
    zones: Zone[];
    selectedZoneId: number | null;
    onZoneSelect: (zoneId: number) => void;
    latitude: number | null;
    longitude: number | null;
    projectDescription: string;
    landUseType: string;
    projectType: string;
    buildingType: string;
    // Additional fields for enhanced AI analysis
    lotAreaTotal?: number;
    lotAreaUsed?: number;
    floorAreaSqm?: number | null;
    numberOfStoreys?: number | null;
    numberOfUnits?: number | null;
    purpose?: string;
    isSubdivision?: boolean;
}

export default function ZoningTypeSelector({
    zones,
    selectedZoneId,
    onZoneSelect,
    latitude,
    longitude,
    projectDescription,
    landUseType,
    projectType,
    buildingType,
    lotAreaTotal = 0,
    lotAreaUsed = 0,
    floorAreaSqm = null,
    numberOfStoreys = null,
    numberOfUnits = null,
    purpose = '',
    isSubdivision = false,
}: ZoningTypeSelectorProps) {
    const [suggestions, setSuggestions] = useState<ZoningSuggestion[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    useEffect(() => {
        const fetchSuggestions = async () => {
            // Show suggestions when we have location and at least some project details
            if (!latitude || !longitude || zones.length === 0) {
                return;
            }

            // Wait for some key fields before analyzing
            if (!projectDescription && !lotAreaTotal && !purpose) {
                return;
            }

            setLoading(true);
            setHasSearched(true);
            try {
                // Use AI service with all available data for comprehensive analysis
                const aiSuggestions = await zoningTypeSuggestionService.suggestZoningType(
                    latitude,
                    longitude,
                    projectDescription || '',
                    landUseType || 'residential',
                    projectType || 'new_construction',
                    zones,
                    {
                        lotAreaTotal,
                        lotAreaUsed,
                        floorAreaSqm,
                        numberOfStoreys,
                        numberOfUnits,
                        purpose,
                        isSubdivision,
                        buildingType,
                    }
                );
                setSuggestions(aiSuggestions);
            } catch (error) {
                console.error('Failed to get AI suggestions:', error);
                setSuggestions([]);
            } finally {
                setLoading(false);
            }
        };

        // Debounce suggestions to avoid too many calls
        const timeoutId = setTimeout(fetchSuggestions, 1000);
        return () => clearTimeout(timeoutId);
    }, [
        latitude,
        longitude,
        zones,
        projectDescription,
        landUseType,
        projectType,
        lotAreaTotal,
        lotAreaUsed,
        floorAreaSqm,
        numberOfStoreys,
        numberOfUnits,
        purpose,
        isSubdivision,
        buildingType,
    ]);

    const handleSuggestionClick = (suggestion: ZoningSuggestion) => {
        onZoneSelect(suggestion.zoneId);
    };

    const selectedZone = zones.find((z) => z.id === selectedZoneId);

    // Don't show anything if no location
    if (!latitude || !longitude) {
        return null;
    }

    return (
        <div className="space-y-4">
            {/* Selected Zone Display */}
            {selectedZone && (
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border-2 border-green-300 dark:border-green-700 rounded-xl shadow-sm">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 dark:bg-green-800 rounded-lg">
                                <CheckCircle className="text-green-600 dark:text-green-400" size={20} />
                            </div>
                            <div>
                                <p className="font-bold text-green-900 dark:text-green-100 text-lg">
                                    {selectedZone.code} - {selectedZone.name}
                                </p>
                                <p className="text-sm text-green-700 dark:text-green-300">
                                    Zone selected for this location
                                </p>
                            </div>
                        </div>
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => onZoneSelect(null)}
                        >
                            Change
                        </Button>
                    </div>
                </div>
            )}

            {/* AI Suggestions Panel - Always show when location is pinned */}
            <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-5 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                        <Sparkles className="text-white" size={20} />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg flex items-center gap-2">
                            AI Zone Suggestions
                            <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-semibold rounded-full">
                                Powered by AI
                            </span>
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Our AI analyzes your location and suggests the most suitable zoning classifications
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="text-center">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400 mx-auto mb-3" />
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Analyzing location with AI...
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                This may take a few seconds
                            </p>
                        </div>
                    </div>
                ) : suggestions.length > 0 ? (
                    <div className="space-y-3">
                        {suggestions.map((suggestion, index) => {
                            const isSelected = selectedZoneId === suggestion.zoneId;
                            const zone = zones.find((z) => z.id === suggestion.zoneId);
                            
                            // Better color coding
                            let cardClass = 'border-2 ';
                            let badgeClass = '';
                            if (suggestion.confidence > 0.75) {
                                cardClass += 'border-green-400 bg-green-50 dark:bg-green-900/20 dark:border-green-700';
                                badgeClass = 'bg-green-500 text-white';
                            } else if (suggestion.confidence > 0.5) {
                                cardClass += 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-700';
                                badgeClass = 'bg-yellow-500 text-white';
                            } else {
                                cardClass += 'border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-600';
                                badgeClass = 'bg-gray-500 text-white';
                            }

                            return (
                                <button
                                    key={suggestion.zoneId}
                                    type="button"
                                    onClick={() => handleSuggestionClick(suggestion)}
                                    className={`w-full p-4 text-left rounded-lg transition-all hover:shadow-lg hover:scale-[1.02] ${cardClass} ${
                                        isSelected ? 'ring-4 ring-blue-400 dark:ring-blue-600 shadow-xl' : ''
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className={`px-3 py-1 rounded-full text-xs font-bold ${badgeClass}`}>
                                                    #{index + 1}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-lg text-gray-900 dark:text-white">
                                                            {suggestion.code}
                                                        </span>
                                                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                            {suggestion.name}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                                                {suggestion.reasoning}
                                            </p>
                                            <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                                                <div className="flex items-center gap-1">
                                                    <TrendingUp size={14} />
                                                    <span>Confidence: {Math.round(suggestion.confidence * 100)}%</span>
                                                </div>
                                                {zone && (
                                                    <div className="flex items-center gap-1">
                                                        <Zap size={14} />
                                                        <span>Active Zone</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <div className="text-right">
                                                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                                    {Math.round(suggestion.confidence * 100)}%
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    match
                                                </div>
                                            </div>
                                            <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full transition-all ${
                                                        suggestion.confidence > 0.75
                                                            ? 'bg-green-500'
                                                            : suggestion.confidence > 0.5
                                                              ? 'bg-yellow-500'
                                                              : 'bg-gray-400'
                                                    }`}
                                                    style={{ width: `${suggestion.confidence * 100}%` }}
                                                />
                                            </div>
                                            {isSelected && (
                                                <div className="px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full">
                                                    Selected
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                ) : hasSearched && !loading ? (
                    <div className="text-center py-6">
                        <p className="text-gray-600 dark:text-gray-400">
                            No suggestions available for this location. Please try a different location or select a zone manually.
                        </p>
                    </div>
                ) : null}
            </div>

            {/* Manual Zone Selection Fallback */}
            {!selectedZone && (
                <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Or select zone manually:
                    </label>
                    <select
                        value={selectedZoneId || ''}
                        onChange={(e) => onZoneSelect(parseInt(e.target.value) || null)}
                        className="w-full rounded-lg border-gray-300 dark:border-gray-700 dark:bg-dark-surface focus:ring-primary focus:border-primary"
                    >
                        <option value="">Select a zone...</option>
                        {zones.map((zone) => (
                            <option key={zone.id} value={zone.id}>
                                {zone.code} - {zone.name}
                            </option>
                        ))}
                    </select>
                </div>
            )}
        </div>
    );
}
