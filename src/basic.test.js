/**
 * Basic Math Tests
 * Simple validation tests to verify Vitest is working correctly
 * These tests ensure the testing infrastructure is properly configured
 */
import { describe, it, expect } from 'vitest'

// Test suite for basic mathematical operations
// Used as a sanity check to verify test framework functionality
describe('Basic Math Tests', () => {
    // Test: Addition operation
    // Validates that basic arithmetic works in the test environment
    it('should add numbers correctly', () => {
        // Perform simple addition and verify the result
        expect(1 + 1).toBe(2)
    })

    // Test: Multiplication operation  
    // Ensures multiplication produces expected results
    it('should multiply numbers correctly', () => {
        // Multiply two numbers and check the product
        expect(2 * 3).toBe(6)
    })

    // Test: String comparison
    // Verifies that string equality assertions work properly
    it('should compare strings', () => {
        // Compare identical strings to ensure matcher functionality
        expect('hello').toBe('hello')
    })
})
