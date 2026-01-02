/**
 * Test Cases for Preferences Service
 * Run these tests to verify preference persistence
 */

import { preferencesService } from '../services/preferencesService';

class PreferencesServiceTests {
    constructor() {
        this.results = [];
        this.passed = 0;
        this.failed = 0;
    }

    // Helper to log test results
    log(testName, passed, message = '') {
        const result = { testName, passed, message };
        this.results.push(result);

        if (passed) {
            this.passed++;
            console.log(`✅ PASS: ${testName}`);
        } else {
            this.failed++;
            console.error(`❌ FAIL: ${testName} - ${message}`);
        }
    }

    // Test 1: Initial load creates default preferences
    testInitialLoad() {
        preferencesService.clearPreferences();
        const prefs = preferencesService.loadPreferences();

        this.log(
            'Initial Load Creates Defaults',
            prefs.language === null && prefs.voiceInstructions === true,
            `Expected language=null, voiceInstructions=true, got ${JSON.stringify(prefs)}`
        );
    }

    // Test 2: Set and get language
    testSetGetLanguage() {
        preferencesService.setLanguage('hi');
        const lang = preferencesService.getLanguage();

        this.log(
            'Set and Get Language',
            lang === 'hi',
            `Expected 'hi', got '${lang}'`
        );
    }

    // Test 3: Persistence across reload
    testPersistence() {
        preferencesService.setLanguage('ta');
        preferencesService.setCropType('rice');

        // Simulate reload by creating new instance
        const newPrefs = preferencesService.loadPreferences();

        this.log(
            'Preferences Persist Across Reload',
            newPrefs.language === 'ta' && newPrefs.cropType === 'rice',
            `Expected language='ta', cropType='rice', got ${JSON.stringify(newPrefs)}`
        );
    }

    // Test 4: Voice instructions toggle
    testVoiceInstructions() {
        preferencesService.setVoiceInstructions(false);
        const enabled = preferencesService.getVoiceInstructions();

        preferencesService.setVoiceInstructions(true);
        const enabledAgain = preferencesService.getVoiceInstructions();

        this.log(
            'Voice Instructions Toggle',
            enabled === false && enabledAgain === true,
            `Expected false then true, got ${enabled} then ${enabledAgain}`
        );
    }

    // Test 5: Multiple preferences update
    testMultiplePreferences() {
        preferencesService.setPreferences({
            language: 'kn',
            cropType: 'wheat',
            showGrid: false
        });

        const lang = preferencesService.getLanguage();
        const crop = preferencesService.getCropType();
        const grid = preferencesService.getShowGrid();

        this.log(
            'Set Multiple Preferences',
            lang === 'kn' && crop === 'wheat' && grid === false,
            `Expected language='kn', cropType='wheat', showGrid=false, got ${lang}, ${crop}, ${grid}`
        );
    }

    // Test 6: User ID and sync
    testUserIdSync() {
        const userId = 'user123';
        preferencesService.setUserId(userId);
        const retrievedId = preferencesService.getUserId();

        this.log(
            'User ID Storage',
            retrievedId === userId,
            `Expected '${userId}', got '${retrievedId}'`
        );
    }

    // Test 7: Clear preferences
    testClearPreferences() {
        preferencesService.setLanguage('en');
        preferencesService.clearPreferences();

        const lang = preferencesService.getLanguage();

        this.log(
            'Clear Preferences',
            lang === null,
            `Expected null after clear, got '${lang}'`
        );
    }

    // Test 8: Check if preferences exist
    testHasPreferences() {
        preferencesService.clearPreferences();
        const hasNone = !preferencesService.hasPreferences();

        preferencesService.setLanguage('en');
        const hasPrefs = preferencesService.hasPreferences();

        this.log(
            'Check Preferences Exist',
            hasNone && hasPrefs,
            `Expected false then true, got ${hasNone} then ${hasPrefs}`
        );
    }

    // Test 9: Timestamps are updated
    testTimestamps() {
        preferencesService.clearPreferences();
        const prefs1 = preferencesService.getAllPreferences();

        // Wait a bit
        setTimeout(() => {
            preferencesService.setLanguage('en');
            const prefs2 = preferencesService.getAllPreferences();

            const timestampUpdated = new Date(prefs2.updatedAt) > new Date(prefs1.updatedAt);

            this.log(
                'Timestamps Update Correctly',
                timestampUpdated,
                `Expected updated timestamp, got created:${prefs1.createdAt}, updated:${prefs2.updatedAt}`
            );

            // Show final results after async test completes
            this.showResults();
        }, 100);
    }

    // Run all tests
    runAllTests() {
        console.log('🧪 Running Preferences Service Tests...\n');

        this.testInitialLoad();
        this.testSetGetLanguage();
        this.testPersistence();
        this.testVoiceInstructions();
        this.testMultiplePreferences();
        this.testUserIdSync();
        this.testClearPreferences();
        this.testHasPreferences();
        this.testTimestamps(); // This one is async
    }

    // Show test results summary
    showResults() {
        console.log('\n' + '='.repeat(50));
        console.log('📊 Test Results Summary');
        console.log('='.repeat(50));
        console.log(`Total Tests: ${this.results.length}`);
        console.log(`✅ Passed: ${this.passed}`);
        console.log(`❌ Failed: ${this.failed}`);
        console.log(`Success Rate: ${((this.passed / this.results.length) * 100).toFixed(1)}%`);
        console.log('='.repeat(50));

        if (this.failed === 0) {
            console.log('🎉 All tests passed!');
        } else {
            console.log('⚠️  Some tests failed. Please review the errors above.');
        }
    }
}

// Export for manual testing in browser console
export const runPreferencesTests = () => {
    const tester = new PreferencesServiceTests();
    tester.runAllTests();
};

// Auto-run in development
if (import.meta.env.DEV) {
    console.log('Development mode detected. Run runPreferencesTests() to test preferences.');
}
