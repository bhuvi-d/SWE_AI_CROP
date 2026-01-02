/**
 * Crop Advice API Service
 * Handles communication with the LLM backend for crop disease advice
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://swe-ai-crop-back.onrender.com';

class CropAdviceService {
    /**
     * Generate crop disease advice
     * @param {Object} diseaseData - { crop, disease, severity, confidence }
     * @returns {Promise<Object>} - Advice object
     */
    async getCropAdvice(diseaseData) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/crop-advice`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(diseaseData),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to get crop advice');
            }

            const result = await response.json();
            return result.data;
        } catch (error) {
            console.error('Error fetching crop advice:', error);
            throw error;
        }
    }

    /**
     * Generate advice for multiple diseases
     * @param {Array} diseasesArray - Array of disease data objects
     * @returns {Promise<Array>} - Array of advice objects
     */
    async getBatchCropAdvice(diseasesArray) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/crop-advice/batch`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ diseases: diseasesArray }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to get batch crop advice');
            }

            const result = await response.json();
            return result.data;
        } catch (error) {
            console.error('Error fetching batch crop advice:', error);
            throw error;
        }
    }

    /**
     * Test if the API is working
     * @returns {Promise<Object>}
     */
    async testConnection() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/test`);

            if (!response.ok) {
                throw new Error('API test failed');
            }

            return await response.json();
        } catch (error) {
            console.error('API connection test failed:', error);
            throw error;
        }
    }
}

// Export singleton instance
export default new CropAdviceService();
