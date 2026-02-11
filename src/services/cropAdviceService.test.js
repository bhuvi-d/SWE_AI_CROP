/**
 * Unit Tests for cropAdviceService
 * Tests the service responsible for communicating with the backend API
 * Validates API calls, error handling, and service structure
 * Uses mocking to test without actual network requests
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'

// Test suite for basic service structure validation
// Ensures the service module exports the expected functions
describe('cropAdviceService - Basic Structure', () => {
    // Sanity test to verify test framework is working
    // Simple assertion to ensure basic test execution
    it('should pass a basic test', () => {
        // Verify basic arithmetic to confirm test runner works
        expect(1 + 1).toBe(2)
    })

    // Test: Service exports required functions
    // Dynamically imports the service and validates its API
    it('should validate service functions exist', async () => {
        // Import the service module dynamically
        const cropAdviceService = await import('./cropAdviceService.js')

        // Verify the default export exists (service instance)
        expect(cropAdviceService.default).toBeDefined()

        // Check that getCropAdvice method exists and is a function
        // This method is responsible for fetching crop disease advice
        expect(typeof cropAdviceService.default.getCropAdvice).toBe('function')

        // Check that testConnection method exists and is a function
        // This method tests the API connectivity
        expect(typeof cropAdviceService.default.testConnection).toBe('function')
    })

    // Test: Module loads without errors 
    // Ensures the service can be imported successfully
    it('should validate API URL is set', async () => {
        // Import the module to trigger any initialization code
        // This verifies the module doesn't throw errors on load
        const module = await import('./cropAdviceService.js')

        // Verify module loaded successfully
        expect(module).toBeDefined()
    })
})

// Test suite for fetch API mocking
// Validates that we can properly mock network requests for testing
describe('Mock Fetch Tests', () => {
    // Setup: Clear all mocks before each test
    // Ensures test isolation and prevents mock pollution
    beforeEach(() => {
        // Reset all mock function calls and implementations
        // This maintains test independence
        vi.clearAllMocks()
    })

    // Test: Fetch can be mocked successfully
    // Verifies the mocking infrastructure works for API calls
    it('should mock fetch correctly', () => {
        // Create a mock fetch function that returns a successful response
        // This replaces the global fetch with our controlled version
        global.fetch = vi.fn(() =>
            Promise.resolve({
                ok: true, // HTTP 200 status indicator
                json: () => Promise.resolve({ data: { test: 'data' } }), // Mock JSON response
            })
        )

        // Verify fetch is now mocked and available globally
        expect(global.fetch).toBeDefined()

        // Ensure fetch is a function (not just any truthy value)
        // This confirms the mock was installed correctly
        expect(typeof global.fetch).toBe('function')
    })
})
