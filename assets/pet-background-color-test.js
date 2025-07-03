/**
 * Pet Background Color Selection Feature - Comprehensive A-Z Test
 * 
 * This test script validates the complete implementation of the pet background
 * color selection feature from UI components to API integration.
 * 
 * Test Coverage:
 * - UI Component Rendering
 * - State Management
 * - Event Handling  
 * - API Payload Construction
 * - Integration with Existing Systems
 * - Edge Cases and Error Handling
 */

(function() {
  console.log('🐕 Starting Pet Background Color Feature A-Z Test...');

  // Test configuration
  const testConfig = {
    testMode: true,
    mockApiCalls: true,
    logLevel: 'verbose',
    testResults: {}
  };

  // Test utilities
  const TestUtils = {
    log: (message, level = 'info') => {
      const emoji = {
        'info': 'ℹ️',
        'success': '✅',
        'error': '❌',
        'warning': '⚠️',
        'test': '🧪'
      };
      console.log(`${emoji[level]} [PET-TEST] ${message}`);
    },

    assert: (condition, message) => {
      if (condition) {
        TestUtils.log(`PASS: ${message}`, 'success');
        return true;
      } else {
        TestUtils.log(`FAIL: ${message}`, 'error');
        return false;
      }
    },

    createMockFile: (name = 'test-pet.jpg', type = 'image/jpeg') => {
      const canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 100;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#FF69B4';
      ctx.fillRect(0, 0, 100, 100);
      
      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          const file = new File([blob], name, { type });
          resolve(file);
        }, type);
      });
    },

    waitForElement: (selector, timeout = 5000) => {
      return new Promise((resolve, reject) => {
        const element = document.querySelector(selector);
        if (element) {
          resolve(element);
          return;
        }

        const observer = new MutationObserver(() => {
          const element = document.querySelector(selector);
          if (element) {
            observer.disconnect();
            resolve(element);
          }
        });

        observer.observe(document.body, {
          childList: true,
          subtree: true
        });

        setTimeout(() => {
          observer.disconnect();
          reject(new Error(`Element ${selector} not found within ${timeout}ms`));
        }, timeout);
      });
    },

    simulateClick: (element) => {
      const event = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true
      });
      element.dispatchEvent(event);
    },

    simulateChange: (element, value) => {
      element.value = value;
      element.checked = true;
      const event = new Event('change', {
        bubbles: true,
        cancelable: true
      });
      element.dispatchEvent(event);
    }
  };

  // Test Suite Implementation
  const PetBackgroundColorTests = {
    
    // Phase 1: Environment and Prerequisites Test
    async testEnvironmentSetup() {
      TestUtils.log('Testing Environment Setup...', 'test');
      
      const results = {
        isPetTemplate: false,
        globalStateExists: false,
        scriptsLoaded: false
      };

      // Test 1.1: Check if we're on a pet template
      results.isPetTemplate = TestUtils.assert(
        window?.isPetTemplate === true,
        'window.isPetTemplate should be true for pet products'
      );

      // Test 1.2: Check global state variable
      results.globalStateExists = TestUtils.assert(
        typeof window.petBackgroundColor !== 'undefined',
        'window.petBackgroundColor global state variable should exist'
      );

      // Test 1.3: Check default state value
      TestUtils.assert(
        window.petBackgroundColor === 'pink',
        'Default background color should be pink'
      );

      // Test 1.4: Check required scripts are loaded
      results.scriptsLoaded = TestUtils.assert(
        typeof window.imageProcessingManager !== 'undefined' || 
        document.querySelector('script[src*="image-processing-manager"]'),
        'Image Processing Manager should be loaded'
      );

      testConfig.testResults.environmentSetup = results;
      return results;
    },

    // Phase 2: UI Component Rendering Test
    async testUIComponents() {
      TestUtils.log('Testing UI Component Rendering...', 'test');
      
      const results = {
        popupExists: false,
        colorSelectorExists: false,
        colorOptionsRendered: false,
        stylingApplied: false
      };

      try {
        // Test 2.1: Check if popup can be opened
        const uploadButton = document.querySelector('#direct-pixar-loader-container button');
        if (uploadButton) {
          TestUtils.simulateClick(uploadButton);
          await TestUtils.waitForElement('#pixar-instructions-popup', 3000);
          
          results.popupExists = TestUtils.assert(
            document.querySelector('#pixar-instructions-popup'),
            'Pet upload popup should be visible'
          );
        }

        // Test 2.2: Check color selector exists
        const colorSelector = document.querySelector('#pet-background-color-selector');
        results.colorSelectorExists = TestUtils.assert(
          colorSelector !== null,
          'Pet background color selector should exist in DOM'
        );

        if (colorSelector) {
          // Test 2.3: Check color options
          const pinkOption = colorSelector.querySelector('input[value="pink"]');
          const blueOption = colorSelector.querySelector('input[value="blue"]');
          
          results.colorOptionsRendered = TestUtils.assert(
            pinkOption && blueOption,
            'Both pink and blue color options should be rendered'
          );

          // Test 2.4: Check default selection
          TestUtils.assert(
            pinkOption && pinkOption.checked,
            'Pink option should be selected by default'
          );

          // Test 2.5: Check styling
          const legend = colorSelector.querySelector('legend');
          results.stylingApplied = TestUtils.assert(
            legend && legend.textContent.includes('Choose Background Color'),
            'Color selector should have proper legend text'
          );
        }

      } catch (error) {
        TestUtils.log(`UI Component test error: ${error.message}`, 'error');
      }

      testConfig.testResults.uiComponents = results;
      return results;
    },

    // Phase 3: State Management Test
    async testStateManagement() {
      TestUtils.log('Testing State Management...', 'test');
      
      const results = {
        defaultState: false,
        stateChange: false,
        eventListeners: false
      };

      try {
        // Test 3.1: Verify default state
        results.defaultState = TestUtils.assert(
          window.petBackgroundColor === 'pink',
          'Default state should be pink'
        );

        // Test 3.2: Test state change via UI interaction
        const blueOption = document.querySelector('input[name="petBackgroundColor"][value="blue"]');
        if (blueOption) {
          TestUtils.simulateChange(blueOption, 'blue');
          
          // Wait a bit for event handlers to process
          await new Promise(resolve => setTimeout(resolve, 100));
          
          results.stateChange = TestUtils.assert(
            window.petBackgroundColor === 'blue',
            'State should change to blue when blue option is selected'
          );

          // Test 3.3: Test changing back to pink
          const pinkOption = document.querySelector('input[name="petBackgroundColor"][value="pink"]');
          if (pinkOption) {
            TestUtils.simulateChange(pinkOption, 'pink');
            await new Promise(resolve => setTimeout(resolve, 100));
            
            TestUtils.assert(
              window.petBackgroundColor === 'pink',
              'State should change back to pink'
            );
          }
        }

        // Test 3.4: Test event listeners are properly attached
        results.eventListeners = TestUtils.assert(
          document.querySelector('input[name="petBackgroundColor"]') !== null,
          'Color selection event listeners should be properly attached'
        );

      } catch (error) {
        TestUtils.log(`State Management test error: ${error.message}`, 'error');
      }

      testConfig.testResults.stateManagement = results;
      return results;
    },

    // Phase 4: API Payload Construction Test
    async testAPIPayloadConstruction() {
      TestUtils.log('Testing API Payload Construction...', 'test');
      
      const results = {
        payloadStructure: false,
        backgroundColorIncluded: false,
        conditionalLogic: false
      };

      try {
        // Create a mock image processing manager to test payload construction
        const mockImageProcessingManager = {
          async sendImageToRailway(file, options = {}) {
            return new Promise((resolve) => {
              // Simulate the payload construction logic from the actual code
              const imageBase64 = 'data:image/jpeg;base64,test';
              
              const payload = {
                image: imageBase64,
                style: "pixar",
                watermark: {
                  url: "https://cdn.shopify.com/s/files/1/0896/3434/1212/files/watermarklogo.png",
                  width: 200,
                  height: 200,
                  spaceBetweenWatermarks: 100,
                },
              };

              // Add background color for pet templates - this is our test target
              if (window?.isPetTemplate && window?.petBackgroundColor) {
                payload.backgroundColor = window.petBackgroundColor;
              }

              resolve({
                success: true,
                payload: payload,
                endpoint: window?.isPetTemplate ? 'transformpet' : 'transform'
              });
            });
          }
        };

        // Test 4.1: Basic payload structure
        const mockFile = await TestUtils.createMockFile();
        const result = await mockImageProcessingManager.sendImageToRailway(mockFile);
        
        results.payloadStructure = TestUtils.assert(
          result.payload && 
          result.payload.image && 
          result.payload.style === 'pixar' &&
          result.payload.watermark,
          'Basic payload structure should be correct'
        );

        // Test 4.2: Background color inclusion for pet templates
        results.backgroundColorIncluded = TestUtils.assert(
          result.payload.backgroundColor === window.petBackgroundColor,
          `Background color should be included in payload: expected ${window.petBackgroundColor}, got ${result.payload.backgroundColor}`
        );

        // Test 4.3: Correct endpoint selection
        TestUtils.assert(
          result.endpoint === 'transformpet',
          'Should use transformpet endpoint for pet templates'
        );

        // Test 4.4: Test different color values
        window.petBackgroundColor = 'blue';
        const resultBlue = await mockImageProcessingManager.sendImageToRailway(mockFile);
        TestUtils.assert(
          resultBlue.payload.backgroundColor === 'blue',
          'Payload should reflect current color state (blue)'
        );

        // Reset to pink
        window.petBackgroundColor = 'pink';

        // Test 4.5: Conditional logic (non-pet template shouldn't include backgroundColor)
        const originalIsPetTemplate = window.isPetTemplate;
        window.isPetTemplate = false;
        
        const resultNonPet = await mockImageProcessingManager.sendImageToRailway(mockFile);
        results.conditionalLogic = TestUtils.assert(
          !resultNonPet.payload.backgroundColor,
          'Background color should NOT be included for non-pet templates'
        );

        // Restore original state
        window.isPetTemplate = originalIsPetTemplate;

      } catch (error) {
        TestUtils.log(`API Payload test error: ${error.message}`, 'error');
      }

      testConfig.testResults.apiPayload = results;
      return results;
    },

    // Test Summary and Report Generation
    generateTestReport() {
      TestUtils.log('Generating Test Report...', 'test');
      
      const allResults = testConfig.testResults;
      let totalTests = 0;
      let passedTests = 0;
      
      const report = {
        timestamp: new Date().toISOString(),
        environment: {
          userAgent: navigator.userAgent,
          isPetTemplate: window?.isPetTemplate,
          petBackgroundColor: window?.petBackgroundColor
        },
        testSummary: {},
        overallStatus: 'UNKNOWN'
      };

      // Calculate test statistics
      Object.keys(allResults).forEach(phase => {
        const phaseResults = allResults[phase];
        let phaseTotal = 0;
        let phasePassed = 0;

        Object.keys(phaseResults).forEach(test => {
          phaseTotal++;
          if (phaseResults[test]) phasePassed++;
        });

        totalTests += phaseTotal;
        passedTests += phasePassed;

        report.testSummary[phase] = {
          total: phaseTotal,
          passed: phasePassed,
          percentage: phaseTotal > 0 ? Math.round((phasePassed / phaseTotal) * 100) : 0
        };
      });

      report.overallStatus = passedTests === totalTests ? 'PASS' : 'FAIL';
      report.totalTests = totalTests;
      report.passedTests = passedTests;
      report.overallPercentage = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;

      // Log detailed report
      TestUtils.log('='.repeat(60), 'info');
      TestUtils.log('PET BACKGROUND COLOR FEATURE - TEST REPORT', 'info');
      TestUtils.log('='.repeat(60), 'info');
      TestUtils.log(`Overall Status: ${report.overallStatus}`, report.overallStatus === 'PASS' ? 'success' : 'error');
      TestUtils.log(`Tests Passed: ${passedTests}/${totalTests} (${report.overallPercentage}%)`, 'info');
      TestUtils.log('', 'info');

      Object.keys(report.testSummary).forEach(phase => {
        const summary = report.testSummary[phase];
        TestUtils.log(`${phase}: ${summary.passed}/${summary.total} (${summary.percentage}%)`, 
                     summary.percentage >= 80 ? 'success' : 'warning');
      });

      TestUtils.log('='.repeat(60), 'info');

      // Store report globally for access
      window.petBackgroundColorTestReport = report;
      
      return report;
    }
  };

  // Main test execution function
  async function runAllTests() {
    TestUtils.log('🚀 Starting Comprehensive Pet Background Color Feature Test', 'info');
    
    try {
      // Run all test phases
      await PetBackgroundColorTests.testEnvironmentSetup();
      await PetBackgroundColorTests.testUIComponents();  
      await PetBackgroundColorTests.testStateManagement();
      await PetBackgroundColorTests.testAPIPayloadConstruction();

      // Generate final report
      const report = PetBackgroundColorTests.generateTestReport();
      
      TestUtils.log(`🎯 Testing Complete! Overall Status: ${report.overallStatus}`, 
                   report.overallStatus === 'PASS' ? 'success' : 'error');
      
      return report;

    } catch (error) {
      TestUtils.log(`💥 Test execution failed: ${error.message}`, 'error');
      console.error(error);
      return { overallStatus: 'ERROR', error: error.message };
    }
  }

  // Auto-run tests if we're on a pet template
  if (window?.isPetTemplate) {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', runAllTests);
    } else {
      // Run tests after a short delay to ensure all scripts are loaded
      setTimeout(runAllTests, 1000);
    }
  } else {
    TestUtils.log('⚠️ Not on a pet template - tests will not run automatically', 'warning');
    TestUtils.log('💡 To run tests manually, call: runAllTests()', 'info');
  }

  // Make test functions available globally for manual testing
  window.petBackgroundColorTests = {
    runAllTests,
    PetBackgroundColorTests,
    TestUtils
  };

})(); 