/**
 * AI Service
 * Simulates sophisticated AI inference for crop disease detection.
 * Provides diagnostics, confidence scores, severity estimation, and plain language explanations.
 */

const DISEASE_DATABASE = {
    tomato: [
        {
            name: "Early Blight",
            scientificName: "Alternaria solani",
            symptoms: ["Concentric rings on leaves", "Lower leaves yellowing"],
            severity: "moderate",
            treatments: ["Copper-based fungicides", "Improve air circulation", "Mulch soil"],
            explanation: "The AI detected characteristic 'bullseye' patterns on the lower leaves, indicating Early Blight fungus."
        },
        {
            name: "Late Blight",
            scientificName: "Phytophthora infestans",
            symptoms: ["Large dark spots", "White fungal growth"],
            severity: "severe",
            treatments: ["Remove infected plants", "Apply fungicide immediately", "Keep leaves dry"],
            explanation: "Analysis reveals rapidly spreading dark lesions suggesting Late Blight, a serious condition requiring immediate action."
        }
    ],
    corn: [
        {
            name: "Common Rust",
            scientificName: "Puccinia sorghi",
            symptoms: ["Reddish-brown pustules", "Powdery spores"],
            severity: "mild",
            treatments: ["Fungicide if severe", "Plant resistant varieties"],
            explanation: "Pustules found on leaf surfaces match Common Rust patterns. Usually manageable unless infection is widespread."
        }
    ],
    general: [
        {
            name: "Healthy",
            severity: "none",
            explanation: "The plant shows vigorous growth with uniform green color and no visible signs of stress or disease.",
            treatments: ["Continue regular care", "Monitor for pests"]
        },
        {
            name: "Nitrogen Deficiency",
            severity: "moderate",
            symptoms: ["Overall yellowing", "Stunted growth"],
            explanation: "Uniform yellowing (chlorosis) suggests a lack of Nitrogen. Consider adding organic compost or nitrogen-rich fertilizer.",
            treatments: ["Apply nitrogen fertilizer", "Check soil pH"]
        }
    ]
};

export const aiService = {
    /**
     * Simulate AI Analysis of an image
     * @param {string} imageData - Base64 image data
     * @param {string} cropContext - Optional crop type hint
     */
    analyze: async (imageData, cropContext = null) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Simulate processing time
                const isHealthy = Math.random() > 0.4;
                const diseases = cropContext && DISEASE_DATABASE[cropContext.toLowerCase()]
                    ? DISEASE_DATABASE[cropContext.toLowerCase()]
                    : DISEASE_DATABASE.general;

                let diagnosis;
                if (isHealthy) {
                    diagnosis = DISEASE_DATABASE.general[0];
                } else {
                    // Pick random disease from context or general
                    diagnosis = diseases[Math.floor(Math.random() * diseases.length)];
                    // Fallback to general deficiency if unhealthy but no specific disease found
                    if (diagnosis.name === 'Healthy') diagnosis = DISEASE_DATABASE.general[1];
                }

                // Simulate confidence
                const confidence = 0.70 + (Math.random() * 0.28); // 70% - 98%

                // Simulate bounding boxes (normalized coordinates 0-1)
                const heatmap = [];
                if (diagnosis.name !== "Healthy") {
                    for (let i = 0; i < 3; i++) {
                        heatmap.push({
                            x: 0.2 + Math.random() * 0.6,
                            y: 0.2 + Math.random() * 0.6,
                            radius: 0.1 + Math.random() * 0.15,
                            intensity: 0.5 + Math.random() * 0.5
                        });
                    }
                }

                // Calculate synthetic scores based on diagnosis
                const healthScore = isHealthy ? Math.floor(80 + Math.random() * 20) : Math.floor(20 + Math.random() * 50);
                const diseasePercentage = isHealthy ? Math.floor(Math.random() * 5) : Math.floor(10 + Math.random() * 40);
                const brownPercentage = isHealthy ? Math.floor(Math.random() * 10) : Math.floor(5 + Math.random() * 20);
                const greenPercentage = 100 - diseasePercentage - brownPercentage;

                resolve({
                    diagnosis: diagnosis.name,
                    scientificName: diagnosis.scientificName,
                    confidence: parseFloat(confidence.toFixed(2)),
                    severity: diagnosis.severity, // mild, moderate, severe, none
                    symptoms: diagnosis.symptoms || [],
                    explanation: diagnosis.explanation,
                    treatments: diagnosis.treatments || [],
                    heatmap: heatmap,
                    timestamp: new Date().toISOString(),
                    // New fields expected by CameraView
                    healthScore: healthScore,
                    greenPercentage: greenPercentage,
                    brownPercentage: brownPercentage,
                    diseasePercentage: diseasePercentage,
                    issues: diagnosis.symptoms || [],
                    recommendations: diagnosis.treatments || [],
                    // Multi-label simulation (other possibilities)
                    otherPossibilities: !isHealthy ? [
                        { name: "Nutrient Deficiency", confidence: 0.15 },
                        { name: "Water Stress", confidence: 0.08 }
                    ] : []
                });
            }, 2000); // 2 second mock delay
        });
    }
};
