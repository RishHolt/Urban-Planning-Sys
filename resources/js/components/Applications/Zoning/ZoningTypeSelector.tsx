import { useState, useEffect } from 'react';
import { Zone } from '../../../lib/zoneDetection';
import { zoningTypeSuggestionService, ZoningSuggestion } from '../../../lib/ai/ZoningTypeSuggestionService';
import { Sparkles, Loader2, CheckCircle, Zap, TrendingUp } from 'lucide-react';
import Button from '../../Button';

interface ZoningTypeSelectorProps {
    zones: Zone[];
    selectedZoneId: number | null;
    onZoneSelect: (zoneId: number | null) => void;
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

    // ZoningTypeSelector is currently disabled (AI + manual selection both off)
    return null;
}
