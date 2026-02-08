/**
 * Training data utilities for zoning type classification model
 * This file contains utilities for preparing training data from historical applications
 */

export interface TrainingSample {
    features: number[];
    label: number; // Zone ID
    metadata: {
        latitude: number;
        longitude: number;
        projectDescription: string;
        landUseType: string;
        projectType: string;
        actualZoneId: number;
    };
}

/**
 * Prepare training data from historical application data
 */
export function prepareTrainingData(
    applications: Array<{
        pin_lat: number;
        pin_lng: number;
        project_description: string;
        land_use_type: string;
        project_type: string;
        zone_id: number;
    }>,
    zones: Array<{ id: number; code: string; name: string; geometry: any }>
): TrainingSample[] {
    return applications
        .filter((app) => app.pin_lat && app.pin_lng && app.zone_id)
        .map((app) => {
            // Extract features (same as in ZoningTypeSuggestionService)
            const features = extractFeaturesForTraining(
                app.pin_lat,
                app.pin_lng,
                app.project_description || '',
                app.land_use_type,
                app.project_type,
                zones
            );

            return {
                features,
                label: app.zone_id,
                metadata: {
                    latitude: app.pin_lat,
                    longitude: app.pin_lng,
                    projectDescription: app.project_description || '',
                    landUseType: app.land_use_type,
                    projectType: app.project_type,
                    actualZoneId: app.zone_id,
                },
            };
        });
}

/**
 * Extract features for training (same logic as in service)
 */
function extractFeaturesForTraining(
    latitude: number,
    longitude: number,
    projectDescription: string,
    landUseType: string,
    projectType: string,
    zones: Array<{ id: number; code: string; name: string; geometry: any }>
): number[] {
    const features: number[] = [];

    // Location features
    features.push((latitude - 5) / 15);
    features.push((longitude - 115) / 15);

    // Zone proximity (simplified)
    const point = { type: 'Point', coordinates: [longitude, latitude] };
    const distances: number[] = [];

    for (const zone of zones.slice(0, 8)) {
        if (zone.geometry) {
            try {
                // Simplified distance calculation
                distances.push(10); // Placeholder
            } catch {
                distances.push(100);
            }
        } else {
            distances.push(100);
        }
    }

    const normalizedDistances = distances.map((d) => Math.min(d / 50, 1));
    features.push(...normalizedDistances);

    while (features.length < 10) {
        features.push(0);
    }

    // Text features
    const lowerDesc = projectDescription.toLowerCase();
    const keywords = [
        'residential',
        'commercial',
        'industrial',
        'apartment',
        'house',
        'building',
        'store',
        'factory',
        'warehouse',
        'office',
    ];

    for (const keyword of keywords) {
        features.push(lowerDesc.includes(keyword) ? 1 : 0);
    }

    features.push(Math.min(projectDescription.length / 500, 1));

    // Categorical features
    const landUseTypes = ['residential', 'commercial', 'industrial', 'agricultural', 'institutional', 'mixed_use'];
    for (const type of landUseTypes) {
        features.push(landUseType === type ? 1 : 0);
    }

    const projectTypes = ['new_construction', 'renovation', 'addition', 'change_of_use'];
    for (const type of projectTypes) {
        features.push(projectType === type ? 1 : 0);
    }

    // Ensure exactly 20 features
    while (features.length < 20) {
        features.push(0);
    }

    return features.slice(0, 20);
}

/**
 * Export training data to JSON format for model training
 */
export function exportTrainingDataToJson(samples: TrainingSample[]): string {
    return JSON.stringify(
        {
            samples: samples.map((sample) => ({
                features: sample.features,
                label: sample.label,
            })),
            metadata: {
                featureCount: 20,
                sampleCount: samples.length,
                generatedAt: new Date().toISOString(),
            },
        },
        null,
        2
    );
}
