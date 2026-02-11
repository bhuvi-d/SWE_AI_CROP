/**
 * Unit Tests for Preferences Service
 * Tests user preference management and local storage persistence
 * Validates language settings, crop types, voice instructions, and data persistence
 * Converted to work with Vitest testing framework
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { preferencesService } from './preferencesService'

// Test suite for preferences service functionality
// Tests cover CRUD operations on user preferences stored in localStorage
describe('Preferences Service', () => {
    // Setup: Clear preferences before each test
    // Ensures test isolation and prevents data pollution between tests
    beforeEach(() => {
        // Clear all stored preferences to start with clean state
        // This prevents previous test data from affecting current test
        preferencesService.clearPreferences()
    })

    // Test: Load default preferences on first use
    // Validates that the service provides sensible defaults
    it('should load default preferences', () => {
        // Load preferences (will be defaults since we cleared in beforeEach)
        const prefs = preferencesService.loadPreferences()

        // Verify preferences object exists
        expect(prefs).toBeDefined()

        // Check that voice instructions default to true (enabled)
        // This ensures accessibility features are on by default
        expect(prefs.voiceInstructions).toBe(true)
    })

    // Test: Set and retrieve language preference
    // Validates language persistence for multilingual support
    it('should set and get language', () => {
        // Set language to Hindi
        // This simulates a user changing their language preference
        preferencesService.setLanguage('hi')

        // Retrieve the saved language
        const lang = preferencesService.getLanguage()

        // Verify language was saved correctly
        expect(lang).toBe('hi')
    })

    // Test: Multiple preferences persist together
    // Validates that setting multiple preferences doesn't overwrite others
    it('should persist preferences', () => {
        // Set language preference to Tamil
        preferencesService.setLanguage('ta')

        // Set crop type preference to rice
        // This is used for personalized advice
        preferencesService.setCropType('rice')

        // Reload all preferences from storage
        // This simulates a page refresh or app restart
        const newPrefs = preferencesService.loadPreferences()

        // Verify both preferences persisted
        expect(newPrefs.language).toBe('ta')
        expect(newPrefs.cropType).toBe('rice')
    })

    // Test: Toggle voice instructions on and off
    // Validates the voice instructions accessibility feature
    it('should toggle voice instructions', () => {
        // Disable voice instructions
        // User might disable for privacy or preference reasons
        preferencesService.setVoiceInstructions(false)

        // Verify voice instructions are now disabled
        expect(preferencesService.getVoiceInstructions()).toBe(false)

        // Re-enable voice instructions
        // User changes their mind and wants audio guidance
        preferencesService.setVoiceInstructions(true)

        // Verify voice instructions are now enabled
        expect(preferencesService.getVoiceInstructions()).toBe(true)
    })

    // Test: Clear all preferences
    // Validates the ability to reset all user settings
    it('should clear preferences', () => {
        // Set a language first to have something to clear
        preferencesService.setLanguage('en')

        // Clear all preferences (reset to defaults)
        // This might be used in a "Reset Settings" feature
        preferencesService.clearPreferences()

        // Try to get the language we just set
        const lang = preferencesService.getLanguage()

        // After clearing, language should be null (not set)
        expect(lang).toBe(null)
    })
})
