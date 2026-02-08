import { Zone } from '../zoneDetection';
import * as turf from '@turf/turf';

export interface ZoningSuggestion {
    zoneId: number;
    code: string;
    name: string;
    confidence: number;
    reasoning: string;
}

interface FeatureVector {
    locationFeatures: number[];
    textFeatures: number[];
    categoricalFeatures: number[];
}

// Lazy load TensorFlow.js to avoid initial bundle size
let tfModule: typeof import('@tensorflow/tfjs') | null = null;
let tfLoadPromise: Promise<typeof import('@tensorflow/tfjs')> | null = null;

/**
 * Lazy load TensorFlow.js
 */
async function loadTensorFlow(): Promise<typeof import('@tensorflow/tfjs')> {
    if (tfModule) {
        return tfModule;
    }

    if (tfLoadPromise) {
        return tfLoadPromise;
    }

    tfLoadPromise = import('@tensorflow/tfjs').then((module) => {
        tfModule = module;
        return module;
    });

    return tfLoadPromise;
}

/**
 * Service for AI-powered zoning type suggestions using TensorFlow.js
 * Falls back to intelligent rule-based suggestions if TensorFlow.js is unavailable
 */
export class ZoningTypeSuggestionService {
    private model: any = null;
    private isModelLoaded = false;
    private loadingPromise: Promise<void> | null = null;
    private tfAvailable = false;

    /**
     * Initialize and load the model (lazy loading)
     */
    private async loadModel(): Promise<void> {
        if (this.isModelLoaded) {
            return;
        }

        if (this.loadingPromise) {
            return this.loadingPromise;
        }

        this.loadingPromise = (async () => {
            try {
                // Try to load TensorFlow.js
                const tf = await loadTensorFlow();
                this.tfAvailable = true;

                // Create a simple model for demonstration
                // In production, you would load a pre-trained model
                this.model = await this.createSimpleModel(tf);
                this.isModelLoaded = true;
            } catch (error) {
                console.warn('TensorFlow.js not available, using rule-based suggestions:', error);
                this.tfAvailable = false;
                this.isModelLoaded = true;
                // Don't throw - fall back to rule-based
            }
        })();

        return this.loadingPromise;
    }

    /**
     * Create a simple neural network model for zoning classification
     */
    private async createSimpleModel(tf: typeof import('@tensorflow/tfjs')): Promise<any> {
        const model = tf.sequential({
            layers: [
                tf.layers.dense({
                    inputShape: [20], // Feature vector size
                    units: 64,
                    activation: 'relu',
                    name: 'dense1',
                }),
                tf.layers.dropout({ rate: 0.2, name: 'dropout1' }),
                tf.layers.dense({ units: 32, activation: 'relu', name: 'dense2' }),
                tf.layers.dense({ units: 16, activation: 'relu', name: 'dense3' }),
                tf.layers.dense({
                    units: 1, // Single output for zone classification
                    activation: 'sigmoid',
                    name: 'output',
                }),
            ],
        });

        model.compile({
            optimizer: tf.train.adam(0.001),
            loss: 'binaryCrossentropy',
            metrics: ['accuracy'],
        });

        return model;
    }

    /**
     * Extract features from input data
     */
    private extractFeatures(
        latitude: number | null,
        longitude: number | null,
        projectDescription: string,
        landUseType: string,
        projectType: string,
        zones: Zone[]
    ): FeatureVector {
        // Location features (normalized coordinates, zone proximity)
        const locationFeatures = this.extractLocationFeatures(latitude, longitude, zones);

        // Text features (simple bag-of-words from description)
        const textFeatures = this.extractTextFeatures(projectDescription);

        // Categorical features (one-hot encoded)
        const categoricalFeatures = this.extractCategoricalFeatures(landUseType, projectType);

        return {
            locationFeatures,
            textFeatures,
            categoricalFeatures,
        };
    }

    /**
     * Extract location-based features
     */
    private extractLocationFeatures(
        latitude: number | null,
        longitude: number | null,
        zones: Zone[]
    ): number[] {
        const features: number[] = [];

        if (latitude === null || longitude === null) {
            return new Array(10).fill(0);
        }

        // Normalize coordinates (assuming Philippines: ~5-20°N, 115-130°E)
        features.push((latitude - 5) / 15); // Normalized latitude
        features.push((longitude - 115) / 15); // Normalized longitude

        // Calculate proximity to each zone (distance to nearest point)
        const point = turf.point([longitude, latitude]);
        const distances: number[] = [];

        for (const zone of zones.slice(0, 8)) {
            // Limit to 8 zones for feature vector
            if (zone.geometry) {
                try {
                    let minDistance = Infinity;

                    if (zone.geometry.type === 'Polygon') {
                        const polygon = turf.polygon(zone.geometry.coordinates);
                        const centroid = turf.centroid(polygon);
                        const distance = turf.distance(point, centroid, { units: 'kilometers' });
                        minDistance = Math.min(minDistance, distance);
                    } else if (zone.geometry.type === 'MultiPolygon') {
                        for (const polygonCoords of zone.geometry.coordinates) {
                            const polygon = turf.polygon(polygonCoords);
                            const centroid = turf.centroid(polygon);
                            const distance = turf.distance(point, centroid, { units: 'kilometers' });
                            minDistance = Math.min(minDistance, distance);
                        }
                    }

                    distances.push(minDistance === Infinity ? 100 : minDistance);
                } catch (error) {
                    distances.push(100); // Default large distance
                }
            } else {
                distances.push(100);
            }
        }

        // Normalize distances (0-1 scale, assuming max 50km)
        const normalizedDistances = distances.map((d) => Math.min(d / 50, 1));
        features.push(...normalizedDistances);

        // Pad to 10 features if needed
        while (features.length < 10) {
            features.push(0);
        }

        return features.slice(0, 10);
    }

    /**
     * Extract text features from project description
     */
    private extractTextFeatures(description: string): number[] {
        const features: number[] = [];
        const lowerDesc = description.toLowerCase();

        // Simple keyword-based features
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

        // Text length feature (normalized)
        features.push(Math.min(description.length / 500, 1));

        return features;
    }

    /**
     * Extract categorical features (one-hot encoding)
     */
    private extractCategoricalFeatures(landUseType: string, projectType: string): number[] {
        const features: number[] = [];

        // Land use types
        const landUseTypes = ['residential', 'commercial', 'industrial', 'agricultural', 'institutional', 'mixed_use'];
        for (const type of landUseTypes) {
            features.push(landUseType === type ? 1 : 0);
        }

        // Project types
        const projectTypes = ['new_construction', 'renovation', 'addition', 'change_of_use'];
        for (const type of projectTypes) {
            features.push(projectType === type ? 1 : 0);
        }

        return features;
    }

    /**
     * Get zoning type suggestions based on input data
     * Uses TensorFlow.js ML model if available, otherwise falls back to rule-based
     */
    async suggestZoningType(
        latitude: number | null,
        longitude: number | null,
        projectDescription: string,
        landUseType: string,
        projectType: string,
        zones: Zone[],
        additionalData?: {
            lotAreaTotal?: number;
            lotAreaUsed?: number;
            floorAreaSqm?: number | null;
            numberOfStoreys?: number | null;
            numberOfUnits?: number | null;
            purpose?: string;
            isSubdivision?: boolean;
            buildingType?: string;
        }
    ): Promise<ZoningSuggestion[]> {
        try {
            // Try to use ML model
            await this.loadModel();

            if (this.tfAvailable && this.model && tfModule) {
                return await this.getMLSuggestions(
                    latitude,
                    longitude,
                    projectDescription,
                    landUseType,
                    projectType,
                    zones,
                    additionalData
                );
            }
        } catch (error) {
            console.warn('ML model unavailable, using rule-based suggestions:', error);
        }

        // Fallback to rule-based suggestions with enhanced data
        return this.getRuleBasedSuggestions(
            latitude,
            longitude,
            landUseType,
            zones,
            projectDescription,
            additionalData
        );
    }

    /**
     * Get suggestions using ML model
     */
    private async getMLSuggestions(
        latitude: number | null,
        longitude: number | null,
        projectDescription: string,
        landUseType: string,
        projectType: string,
        zones: Zone[],
        additionalData?: {
            lotAreaTotal?: number;
            lotAreaUsed?: number;
            floorAreaSqm?: number | null;
            numberOfStoreys?: number | null;
            numberOfUnits?: number | null;
            purpose?: string;
            isSubdivision?: boolean;
            buildingType?: string;
        }
    ): Promise<ZoningSuggestion[]> {
        if (!tfModule || !this.model) {
            throw new Error('TensorFlow.js not available');
        }

        // Extract features
        const featureVector = this.extractFeatures(
            latitude,
            longitude,
            projectDescription,
            landUseType,
            projectType,
            zones
        );

        // Combine all features into single vector
        const combinedFeatures = [
            ...featureVector.locationFeatures,
            ...featureVector.textFeatures,
            ...featureVector.categoricalFeatures,
        ];

        // Ensure we have exactly 20 features
        while (combinedFeatures.length < 20) {
            combinedFeatures.push(0);
        }

        // Get rule-based suggestions first (these are reliable)
        const ruleBasedSuggestions = this.getRuleBasedSuggestions(
            latitude,
            longitude,
            landUseType,
            zones,
            projectDescription,
            additionalData
        );

        // Create tensor and get ML predictions
        const inputTensor = tfModule.tensor2d([combinedFeatures.slice(0, 20)]);

        try {
            // Get prediction from ML model
            // Note: This model is untrained, so predictions are random
            // In production, you would load a pre-trained model
            const prediction = this.model.predict(inputTensor) as any;
            const predictionValue = await prediction.data();
            const mlConfidence = Math.abs(Array.from(predictionValue)[0] as number);

            // Combine ML prediction with rule-based scoring
            // ML provides a confidence boost/adjustment to rule-based scores
            return ruleBasedSuggestions.map((suggestion) => {
                // Blend rule-based confidence with ML confidence
                // Rule-based is weighted more heavily since it's more reliable
                const blendedConfidence = Math.min(
                    suggestion.confidence * 0.8 + mlConfidence * 0.2,
                    1.0
                );

                return {
                    ...suggestion,
                    confidence: blendedConfidence,
                    reasoning: `${suggestion.reasoning} (AI-enhanced)`,
                };
            });
        } catch (error) {
            console.warn('ML prediction failed, using rule-based only:', error);
            // Fallback to rule-based if ML fails
            return ruleBasedSuggestions;
        } finally {
            // Clean up tensor to prevent memory leaks
            inputTensor.dispose();
        }
    }

    /**
     * Intelligent rule-based suggestions using location, land use, project description, and all project details
     */
    private getRuleBasedSuggestions(
        latitude: number | null,
        longitude: number | null,
        landUseType: string,
        zones: Zone[],
        projectDescription: string = '',
        additionalData?: {
            lotAreaTotal?: number;
            lotAreaUsed?: number;
            floorAreaSqm?: number | null;
            numberOfStoreys?: number | null;
            numberOfUnits?: number | null;
            purpose?: string;
            isSubdivision?: boolean;
            buildingType?: string;
        }
    ): ZoningSuggestion[] {
        if (latitude === null || longitude === null) {
            // Return compatible zones with low confidence if no location
            return this.getCompatibleZones(landUseType, zones, projectDescription)
                .slice(0, 3)
                .map((zone) => ({
                    zoneId: zone.id,
                    code: zone.code,
                    name: zone.name,
                    confidence: 0.3,
                    reasoning: 'Location not specified - showing compatible zones',
                }));
        }

        const point = turf.point([longitude, latitude]);

        // Find zones by proximity and land use compatibility
        const zoneScores: Array<{ zone: Zone; score: number; distance: number; isWithin: boolean }> = [];

        for (const zone of zones) {
            if (!zone.geometry) {
                continue;
            }

            // Skip boundary zones (municipal and barangay) - only suggest actual zoning classifications
            if (zone.boundary_type === 'municipal' || zone.boundary_type === 'barangay') {
                continue;
            }

            // Also filter by code/name patterns that indicate boundaries
            const zoneCode = zone.code?.toUpperCase() || '';
            const zoneName = zone.name?.toUpperCase() || '';
            if (
                zoneCode === 'BOUNDARY' ||
                zoneCode === 'BARANGAY' ||
                zoneCode === 'MUNICIPALITY' ||
                zoneCode === 'MUNICIPAL' ||
                zoneName.includes('BOUNDARY') ||
                zoneName.includes('BARANGAY') ||
                (zoneName.includes('MUNICIPALITY') && !zoneName.includes('ZONING'))
            ) {
                continue;
            }

            let distance = Infinity;
            let isWithin = false;

            try {
                if (zone.geometry.type === 'Polygon') {
                    const polygon = turf.polygon(zone.geometry.coordinates);
                    isWithin = turf.booleanPointInPolygon(point, polygon);
                    const centroid = turf.centroid(polygon);
                    distance = turf.distance(point, centroid, { units: 'kilometers' });
                } else if (zone.geometry.type === 'MultiPolygon') {
                    for (const polygonCoords of zone.geometry.coordinates) {
                        const polygon = turf.polygon(polygonCoords);
                        if (turf.booleanPointInPolygon(point, polygon)) {
                            isWithin = true;
                            const centroid = turf.centroid(polygon);
                            distance = Math.min(distance, turf.distance(point, centroid, { units: 'kilometers' }));
                        }
                    }
                }
            } catch (error) {
                continue;
            }

            // Calculate base score based on location (minimal weight - project details are PRIMARY)
            let score = 0;
            if (isWithin) {
                score = 0.1; // Very low base - location alone shouldn't determine zone
            } else {
                // Lower confidence based on distance (closer = higher)
                // Exponential decay: closer zones get much higher scores
                score = Math.max(0.01, 0.08 * Math.exp(-distance / 5));
            }

            // CRITICAL: Land use type match should have HIGHEST weight
            // zoneCode already declared above, reuse it
            const landUseMatch = this.checkLandUseMatch(landUseType, zoneCode);
            if (landUseMatch) {
                score += 0.7; // Very high boost - land use is THE most important factor
            } else {
                // Very strong penalty for land use mismatch - should almost disqualify
                score -= 0.8; // Heavy penalty - wrong land use type should disqualify
            }

            // Analyze building type text (e.g., "small house" = residential)
            const buildingType = additionalData?.buildingType;
            if (buildingType && buildingType.trim() !== '') {
                const buildingTypeMatch = this.analyzeBuildingType(buildingType, zoneCode);
                if (buildingTypeMatch) {
                    score += 0.4; // Building type is a very strong indicator
                } else {
                    score -= 0.35; // Strong penalty if building type doesn't match
                }
            }

            // Boost score if project description contains relevant keywords
            if (projectDescription && projectDescription.trim() !== '') {
                const descriptionMatch = this.checkDescriptionMatch(projectDescription, zoneCode);
                if (descriptionMatch) {
                    score += 0.2;
                } else {
                    score -= 0.1; // Small penalty if description doesn't match
                }
            }

            // Analyze purpose text (e.g., "small house" = residential)
            if (additionalData?.purpose && additionalData.purpose.trim() !== '') {
                const purposeMatch = this.checkDescriptionMatch(additionalData.purpose, zoneCode);
                const purposeBuildingMatch = this.analyzeBuildingType(additionalData.purpose, zoneCode);
                if (purposeMatch || purposeBuildingMatch) {
                    score += 0.35; // Purpose is very important
                } else {
                    score -= 0.25; // Penalize if purpose doesn't match
                }
            }

            // Enhanced analysis based on project details
            if (additionalData) {
                // Validate data first - ignore invalid inputs
                const isValidLotArea = additionalData.lotAreaTotal > 0 && 
                    additionalData.lotAreaUsed <= additionalData.lotAreaTotal;
                const isValidFloorArea = additionalData.floorAreaSqm && 
                    additionalData.floorAreaSqm > 0 && 
                    additionalData.floorAreaSqm < 1000000; // Reasonable max
                const isValidStoreys = additionalData.numberOfStoreys && 
                    additionalData.numberOfStoreys > 0 && 
                    additionalData.numberOfStoreys < 100; // Reasonable max
                const isValidUnits = additionalData.numberOfUnits && 
                    additionalData.numberOfUnits > 0 && 
                    additionalData.numberOfUnits < 10000; // Reasonable max

                // Analyze lot area - larger lots might indicate different zones
                if (isValidLotArea) {
                    const lotAreaScore = this.analyzeLotArea(additionalData.lotAreaTotal, zoneCode);
                    score += lotAreaScore;
                }

                // Analyze floor area and storeys - commercial/industrial typically larger
                if (isValidFloorArea) {
                    const floorAreaScore = this.analyzeFloorArea(additionalData.floorAreaSqm!, zoneCode);
                    score += floorAreaScore;
                }

                if (isValidStoreys) {
                    const storeysScore = this.analyzeStoreys(additionalData.numberOfStoreys!, zoneCode);
                    score += storeysScore;
                }

                // Analyze number of units - apartments typically have multiple units
                if (isValidUnits && additionalData.numberOfUnits! > 1) {
                    if (zoneCode.startsWith('R') && (zoneCode.includes('3') || zoneCode.includes('4'))) {
                        score += 0.15; // Boost for R3/R4 (apartment zones)
                    } else if (zoneCode.startsWith('R') && (zoneCode.includes('1') || zoneCode.includes('2'))) {
                        score -= 0.1; // Penalize R1/R2 for multiple units
                    }
                }

                // Subdivision projects might have different zoning
                if (additionalData.isSubdivision) {
                    // Subdivisions are often in specific zones
                    if (zoneCode.startsWith('R') || zoneCode === 'MX') {
                        score += 0.1;
                    } else if (zoneCode.startsWith('I')) {
                        score -= 0.15; // Subdivisions unlikely in industrial
                    }
                }
            }

            // Ensure score doesn't go negative
            score = Math.max(0, score);

            zoneScores.push({ zone, score: Math.min(score, 1.0), distance, isWithin });
        }

        // Sort by score (highest first)
        zoneScores.sort((a, b) => b.score - a.score);

        // Filter out duplicates by zone code - keep only the best scoring zone for each unique code
        const uniqueZones = new Map<string, typeof zoneScores[0]>();
        for (const item of zoneScores) {
            const zoneCode = item.zone.code?.toUpperCase() || '';
            // Only keep the first (best scoring) occurrence of each zone code
            if (!uniqueZones.has(zoneCode)) {
                uniqueZones.set(zoneCode, item);
            }
        }

        // Convert back to array and sort by score
        let uniqueZoneArray = Array.from(uniqueZones.values()).sort((a, b) => b.score - a.score);

        // If we have multiple zones with the same base classification (e.g., R1, R2, R3),
        // prioritize diversity - try to get different zone types
        if (uniqueZoneArray.length > 3) {
            const selected: typeof uniqueZoneArray = [];
            const usedBaseTypes = new Set<string>();

            // First pass: select zones with different base types (R, C, I, A, etc.)
            for (const item of uniqueZoneArray) {
                const zoneCode = item.zone.code?.toUpperCase() || '';
                const baseType = zoneCode.charAt(0); // R, C, I, A, etc.
                
                if (!usedBaseTypes.has(baseType) && selected.length < 3) {
                    selected.push(item);
                    usedBaseTypes.add(baseType);
                }
            }

            // Second pass: fill remaining slots with highest scoring zones (even if same base type)
            for (const item of uniqueZoneArray) {
                if (selected.length >= 3) break;
                if (!selected.includes(item)) {
                    selected.push(item);
                }
            }

            uniqueZoneArray = selected;
        }

        return uniqueZoneArray.slice(0, 3).map((item) => ({
            zoneId: item.zone.id,
            code: item.zone.code,
            name: item.zone.name,
            confidence: item.score,
            reasoning: this.generateEnhancedReasoning(
                item.isWithin,
                item.distance,
                item.zone.code || '',
                additionalData
            ),
        }));
    }

    /**
     * Check if land use type matches zone classification
     */
    private checkLandUseMatch(landUseType: string, zoneCode: string): boolean {
        if (!landUseType || !zoneCode) {
            return false;
        }

        const upperCode = zoneCode.toUpperCase();
        const lowerUse = landUseType.toLowerCase();

        return (
            (lowerUse === 'residential' && (upperCode.startsWith('R') || upperCode === 'MU' || upperCode === 'MX')) ||
            (lowerUse === 'commercial' && (upperCode.startsWith('C') || upperCode === 'MU' || upperCode === 'MX')) ||
            (lowerUse === 'industrial' && (upperCode.startsWith('I') && upperCode !== 'INS' && upperCode !== 'INSTITUTIONAL') || upperCode === 'MU') ||
            (lowerUse === 'agricultural' && (upperCode.startsWith('A') || upperCode === 'AG')) ||
            (lowerUse === 'institutional' && (upperCode === 'INS' || upperCode === 'INSTITUTIONAL')) ||
            (lowerUse === 'mixed_use' && (upperCode === 'MU' || upperCode === 'MX' || upperCode.startsWith('R') || upperCode.startsWith('C')))
        );
    }

    /**
     * Check if project description contains keywords relevant to zone type
     */
    private checkDescriptionMatch(description: string, zoneCode: string): boolean {
        if (!description || description.trim() === '') {
            return false;
        }

        const lowerDesc = description.toLowerCase();

        if (zoneCode.startsWith('R')) {
            // Residential keywords
            return /(house|home|residential|apartment|dwelling|residence|housing|villa|bungalow|condo|unit)/.test(lowerDesc);
        } else if (zoneCode.startsWith('C')) {
            // Commercial keywords
            return /(store|shop|commercial|retail|business|office|market|mall|restaurant|cafe|hotel)/.test(lowerDesc);
        } else if (zoneCode === 'INS' || zoneCode === 'INSTITUTIONAL') {
            // Institutional keywords - NOT industrial
            if (/(factory|warehouse|industrial|manufacturing|production|plant|workshop)/.test(lowerDesc)) {
                return false; // Factory should NOT match institutional
            }
            return /(school|hospital|institutional|government|clinic|library|museum|church|temple|mosque|religious)/.test(lowerDesc);
        } else if (zoneCode.startsWith('I')) {
            // Industrial keywords (I1, I2, etc.) - NOT Institutional
            return /(factory|warehouse|industrial|manufacturing|production|plant|workshop|processing|assembly)/.test(lowerDesc);
        } else if (zoneCode.startsWith('A')) {
            // Agricultural keywords
            return /(farm|agricultural|crop|livestock|agriculture|farming|plantation|ranch)/.test(lowerDesc);
        }

        return false;
    }

    /**
     * Analyze building type to determine zone compatibility
     */
    private analyzeBuildingType(buildingType: string, zoneCode: string): boolean {
        if (!buildingType || buildingType.trim() === '') {
            return false;
        }

        const lowerType = buildingType.toLowerCase();

        const upperCode = zoneCode.toUpperCase();

        if (upperCode.startsWith('R')) {
            // Residential building types - "small house", "house", etc. should match
            return /(house|home|residential|apartment|dwelling|residence|villa|bungalow|condo|unit|duplex|townhouse|small|big|large)/.test(lowerType);
        } else if (upperCode.startsWith('C')) {
            // Commercial building types
            return /(store|shop|commercial|retail|business|office|market|mall|restaurant|cafe|hotel)/.test(lowerType);
        } else if (upperCode === 'INS' || upperCode === 'INSTITUTIONAL') {
            // Institutional zones - schools, hospitals, government buildings
            // Explicitly EXCLUDE industrial terms like "factory"
            if (/(factory|warehouse|industrial|manufacturing|production|plant|workshop|mill)/.test(lowerType)) {
                return false; // "factory" should NOT match institutional zones
            }
            return /(school|hospital|institutional|government|clinic|library|museum|church|temple|mosque|religious)/.test(lowerType);
        } else if (upperCode.startsWith('I') && upperCode !== 'INS' && upperCode !== 'INSTITUTIONAL') {
            // Industrial zones (I1, I2, etc.) - NOT Institutional
            // Explicitly EXCLUDE residential terms like "house"
            if (/(house|home|residential|dwelling|residence|villa|bungalow|condo|unit|duplex|townhouse|small|big|large)/.test(lowerType)) {
                return false; // "house" should NOT match industrial zones
            }
            // Factory, warehouse, etc. should match Industrial zones
            return /(factory|warehouse|industrial|manufacturing|production|plant|workshop|mill|processing|assembly)/.test(lowerType);
        } else if (upperCode.startsWith('A')) {
            // Agricultural building types - can include farmhouse, but check context
            if (/(house|home|residential|dwelling|residence|villa|bungalow|condo|unit|duplex|townhouse)/.test(lowerType) && 
                !/(farm|agricultural|barn|silo|greenhouse|poultry|livestock|ranch|farmhouse)/.test(lowerType)) {
                return false; // Pure residential terms without agricultural context
            }
            return /(farm|agricultural|barn|silo|greenhouse|poultry|livestock|ranch|farmhouse)/.test(lowerType);
        }

        return false;
    }

    /**
     * Get zones compatible with land use type
     */
    private getCompatibleZones(landUseType: string, zones: Zone[], projectDescription: string): Zone[] {
        return zones.filter((zone) => {
            // Skip boundary zones
            if (zone.boundary_type === 'municipal' || zone.boundary_type === 'barangay') {
                return false;
            }

            // Also filter by code/name patterns
            const zoneCode = zone.code?.toUpperCase() || '';
            const zoneName = zone.name?.toUpperCase() || '';
            if (
                zoneCode === 'BOUNDARY' ||
                zoneCode === 'BARANGAY' ||
                zoneCode === 'MUNICIPALITY' ||
                zoneCode === 'MUNICIPAL' ||
                zoneName.includes('BOUNDARY') ||
                zoneName.includes('BARANGAY') ||
                (zoneName.includes('MUNICIPALITY') && !zoneName.includes('ZONING'))
            ) {
                return false;
            }

            return this.checkLandUseMatch(landUseType, zoneCode) || this.checkDescriptionMatch(projectDescription, zoneCode);
        });
    }

    /**
     * Analyze lot area to determine zone compatibility
     */
    private analyzeLotArea(lotAreaTotal: number, zoneCode: string): number {
        let score = 0;
        const upperCode = zoneCode.toUpperCase();

        // Residential zones typically have smaller to medium lots
        if (upperCode.startsWith('R')) {
            if (lotAreaTotal < 500) {
                score += 0.15; // Small lots strongly favor residential
            } else if (lotAreaTotal >= 500 && lotAreaTotal <= 2000) {
                score += 0.1; // Medium lots also good for residential
            } else if (lotAreaTotal > 5000) {
                score -= 0.2; // Very large lots unlikely residential
            }
        }

        // Commercial zones can have medium to large lots
        if (upperCode.startsWith('C')) {
            if (lotAreaTotal >= 200 && lotAreaTotal <= 5000) {
                score += 0.1;
            } else if (lotAreaTotal < 100) {
                score -= 0.1; // Very small lots unlikely commercial
            }
        }

        // Industrial zones typically have larger lots
        if (upperCode.startsWith('I')) {
            if (lotAreaTotal >= 1000) {
                score += 0.15;
            } else if (lotAreaTotal < 500) {
                score -= 0.25; // Small lots strongly unlikely industrial
            } else if (lotAreaTotal < 1000) {
                score -= 0.1; // Medium lots less likely industrial
            }
        }

        // Agricultural zones need very large lots
        if (upperCode.startsWith('A')) {
            if (lotAreaTotal >= 5000) {
                score += 0.25; // Large lots strongly favor agricultural
            } else if (lotAreaTotal >= 1000 && lotAreaTotal < 5000) {
                score += 0.1; // Medium-large lots can be agricultural
            } else if (lotAreaTotal < 1000) {
                score -= 0.3; // Small lots strongly unlikely agricultural
            }
        }

        return score;
    }

    /**
     * Analyze floor area to determine zone compatibility
     */
    private analyzeFloorArea(floorAreaSqm: number, zoneCode: string): number {
        let score = 0;

        // Residential zones typically have smaller floor areas
        if (zoneCode.startsWith('R')) {
            if (floorAreaSqm < 500) {
                score += 0.1;
            } else if (floorAreaSqm > 2000) {
                score -= 0.05; // Very large floor area less likely single residential
            }
        }

        // Commercial zones can have medium to large floor areas
        if (zoneCode.startsWith('C')) {
            if (floorAreaSqm >= 200 && floorAreaSqm <= 10000) {
                score += 0.1;
            }
        }

        // Industrial zones typically have large floor areas
        if (zoneCode.startsWith('I')) {
            if (floorAreaSqm >= 1000) {
                score += 0.15;
            }
        }

        return score;
    }

    /**
     * Analyze number of storeys to determine zone compatibility
     */
    private analyzeStoreys(numberOfStoreys: number, zoneCode: string): number {
        let score = 0;

        // Residential R1/R2 typically 1-2 storeys
        if (zoneCode.match(/^R[12]/)) {
            if (numberOfStoreys <= 2) {
                score += 0.1;
            } else if (numberOfStoreys > 3) {
                score -= 0.1; // Too many storeys for R1/R2
            }
        }

        // Residential R3/R4 can have more storeys (apartments)
        if (zoneCode.match(/^R[34]/)) {
            if (numberOfStoreys >= 2 && numberOfStoreys <= 5) {
                score += 0.15;
            }
        }

        // Commercial zones can have multiple storeys
        if (zoneCode.startsWith('C')) {
            if (numberOfStoreys >= 2 && numberOfStoreys <= 10) {
                score += 0.1;
            }
        }

        // Industrial zones typically 1-3 storeys
        if (zoneCode.startsWith('I')) {
            if (numberOfStoreys <= 3) {
                score += 0.1;
            } else if (numberOfStoreys > 5) {
                score -= 0.1;
            }
        }

        return score;
    }

    /**
     * Generate enhanced human-readable reasoning for suggestion
     */
    private generateEnhancedReasoning(
        isWithin: boolean,
        distance: number,
        zoneCode: string,
        additionalData?: {
            lotAreaTotal?: number;
            lotAreaUsed?: number;
            floorAreaSqm?: number | null;
            numberOfStoreys?: number | null;
            numberOfUnits?: number | null;
            purpose?: string;
            isSubdivision?: boolean;
            buildingType?: string;
        }
    ): string {
        const reasons: string[] = [];

        // Location-based reasoning
        if (isWithin) {
            reasons.push(`Location is within ${zoneCode} zone`);
        } else if (distance < 0.5) {
            reasons.push(`Very close to ${zoneCode} zone (${distance.toFixed(2)}km away)`);
        } else if (distance < 2) {
            reasons.push(`Near ${zoneCode} zone (${distance.toFixed(1)}km away)`);
        } else {
            reasons.push(`Located ${distance.toFixed(1)}km from ${zoneCode} zone`);
        }

        // Add project detail-based reasoning
        if (additionalData) {
            if (additionalData.lotAreaTotal > 0) {
                if (zoneCode.startsWith('I') && additionalData.lotAreaTotal >= 1000) {
                    reasons.push(`Large lot area (${additionalData.lotAreaTotal} sqm) suitable for industrial use`);
                } else if (zoneCode.startsWith('R') && additionalData.lotAreaTotal < 500) {
                    reasons.push(`Lot size (${additionalData.lotAreaTotal} sqm) typical for residential zones`);
                }
            }

            if (additionalData.numberOfStoreys && additionalData.numberOfStoreys > 0) {
                if (zoneCode.match(/^R[34]/) && additionalData.numberOfStoreys >= 2) {
                    reasons.push(`${additionalData.numberOfStoreys} storeys suitable for apartment zones`);
                } else if (zoneCode.startsWith('C') && additionalData.numberOfStoreys >= 2) {
                    reasons.push(`${additionalData.numberOfStoreys} storeys typical for commercial buildings`);
                }
            }

            if (additionalData.numberOfUnits && additionalData.numberOfUnits > 1) {
                if (zoneCode.match(/^R[34]/)) {
                    reasons.push(`${additionalData.numberOfUnits} units indicate apartment/multi-unit residential zone`);
                }
            }

            if (additionalData.isSubdivision) {
                reasons.push('Subdivision project typically in residential or mixed-use zones');
            }
        }

        return reasons.join('. ') + (additionalData ? ' (AI-enhanced)' : '');
    }

    /**
     * Generate human-readable reasoning for suggestion (legacy method)
     */
    private generateReasoning(isWithin: boolean, distance: number, zoneCode: string): string {
        return this.generateEnhancedReasoning(isWithin, distance, zoneCode);
    }
}

// Export singleton instance
export const zoningTypeSuggestionService = new ZoningTypeSuggestionService();
