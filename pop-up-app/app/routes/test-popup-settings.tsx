import type { LoaderFunctionArgs } from "@remix-run/node";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Popup Settings Test</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .test-section {
            margin-bottom: 30px;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 5px;
        }
        .test-button {
            background: #007cba;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            margin: 5px;
        }
        .test-button:hover {
            background: #005a8b;
        }
        .settings-display {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin: 10px 0;
            font-family: monospace;
            white-space: pre-wrap;
        }
        .success {
            color: #28a745;
            font-weight: bold;
        }
        .error {
            color: #dc3545;
            font-weight: bold;
        }
        .popup-preview {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 9999;
            display: none;
            justify-content: center;
            align-items: center;
        }
        .popup-preview.show {
            display: flex;
        }
        .popup-container-preview {
            background: white;
            border-radius: 12px;
            padding: 30px;
            max-width: 400px;
            width: 90%;
            position: relative;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }
        .popup-close-preview {
            position: absolute;
            top: 15px;
            right: 15px;
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            opacity: 0.7;
        }
        .popup-title-preview {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
            text-align: center;
        }
        .popup-description-preview {
            font-size: 16px;
            margin-bottom: 20px;
            text-align: center;
            line-height: 1.5;
        }
        .popup-button-preview {
            background: #007cba;
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: 6px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            width: 100%;
        }
        .position-preview {
            margin: 10px 0;
            padding: 10px;
            border: 2px dashed #ccc;
            text-align: center;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎯 Popup Settings Test & Preview</h1>
        <p><strong>This page tests if your popup settings from the Shopify admin are working correctly.</strong></p>
        
        <div class="test-section">
            <h2>1. Test API Connection</h2>
            <button class="test-button" onclick="testApiConnection()">Test API Connection</button>
            <div id="api-result"></div>
        </div>

        <div class="test-section">
            <h2>2. Current Settings from Database</h2>
            <button class="test-button" onclick="loadCurrentSettings()">Load Current Settings</button>
            <div id="settings-display" class="settings-display">Click "Load Current Settings" to see your database settings...</div>
        </div>

        <div class="test-section">
            <h2>3. Preview Popup with Current Settings</h2>
            <button class="test-button" onclick="previewPopup()">Preview Popup</button>
            <p><em>This will show how the popup looks with your current database settings</em></p>
            
            <h3>Position Preview:</h3>
            <div class="position-preview" id="position-preview">Position will be shown here after loading settings</div>
        </div>

        <div class="test-section">
            <h2>4. Test Settings Update</h2>
            <p>Change settings in your Shopify admin panel, then click below to see if they update:</p>
            <button class="test-button" onclick="testSettingsUpdate()">Refresh & Test Settings</button>
            <div id="update-result"></div>
        </div>

        <div class="test-section">
            <h2>5. Test Form Submission</h2>
            <button class="test-button" onclick="testFormSubmission()">Test Email/Phone Storage</button>
            <div id="form-result"></div>
        </div>
    </div>

    <!-- Popup Preview -->
    <div id="popup-preview" class="popup-preview">
        <div class="popup-container-preview" id="popup-container-preview">
            <button class="popup-close-preview" onclick="closePreview()">&times;</button>
            <h2 class="popup-title-preview" id="popup-title-preview">Loading...</h2>
            <p class="popup-description-preview" id="popup-description-preview">Loading...</p>
            <button class="popup-button-preview" id="popup-button-preview">Loading...</button>
        </div>
    </div>

    <script>
        let currentSettings = null;

        // Test API connection
        async function testApiConnection() {
            const resultDiv = document.getElementById('api-result');
            resultDiv.innerHTML = '🔄 Testing connection...';
            
            try {
                const response = await fetch('/api/popup-settings', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Shopify-Shop-Domain': 'booksss12345.myshopify.com',
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    resultDiv.innerHTML = '<span class="success">✅ API Connection Successful!</span><br>Status: ' + response.status;
                    return true;
                } else {
                    resultDiv.innerHTML = '<span class="error">❌ API Connection Failed</span><br>Status: ' + response.status;
                    return false;
                }
            } catch (error) {
                resultDiv.innerHTML = '<span class="error">❌ Connection Error: ' + error.message + '</span>';
                return false;
            }
        }

        // Load current settings
        async function loadCurrentSettings() {
            const displayDiv = document.getElementById('settings-display');
            displayDiv.innerHTML = '🔄 Loading settings...';
            
            try {
                const response = await fetch('/api/popup-settings', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Shopify-Shop-Domain': 'booksss12345.myshopify.com',
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    currentSettings = data.settings;
                    
                    displayDiv.innerHTML =
                        '✅ Settings Loaded Successfully:\n\n' +
                        '📝 Title: "' + currentSettings.title + '"\n' +
                        '📄 Description: "' + currentSettings.description + '"\n' +
                        '💰 Discount: ' + currentSettings.discountPercentage + '%\n' +
                        '📍 Position: ' + currentSettings.position + '\n' +
                        '⏱️ Delay: ' + currentSettings.delaySeconds + ' seconds\n' +
                        '🔄 Trigger: ' + currentSettings.triggerType + '\n' +
                        '📅 Frequency: ' + currentSettings.frequency + '\n' +
                        '🎨 Background: ' + currentSettings.backgroundColor + '\n' +
                        '🖋️ Text Color: ' + currentSettings.textColor + '\n' +
                        '🔘 Button Color: ' + currentSettings.buttonColor + '\n' +
                        '✅ Enabled: ' + currentSettings.isEnabled;
                    
                    // Update position preview
                    document.getElementById('position-preview').innerHTML = 
                        'Position: <strong>' + currentSettings.position + '</strong> | ' +
                        'Delay: <strong>' + currentSettings.delaySeconds + 's</strong> | ' +
                        'Trigger: <strong>' + currentSettings.triggerType + '</strong>';
                        
                } else {
                    displayDiv.innerHTML = '❌ Failed to load settings: ' + response.status;
                }
            } catch (error) {
                displayDiv.innerHTML = '❌ Error: ' + error.message;
            }
        }

        // Preview popup
        async function previewPopup() {
            if (!currentSettings) {
                await loadCurrentSettings();
            }
            
            if (currentSettings) {
                // Update preview with current settings
                document.getElementById('popup-title-preview').textContent = currentSettings.title;
                document.getElementById('popup-description-preview').textContent = currentSettings.description;
                document.getElementById('popup-button-preview').textContent = 'Get ' + currentSettings.discountPercentage + '% Discount';
                
                // Apply colors
                const container = document.getElementById('popup-container-preview');
                container.style.backgroundColor = currentSettings.backgroundColor;
                container.style.color = currentSettings.textColor;
                
                const button = document.getElementById('popup-button-preview');
                button.style.backgroundColor = currentSettings.buttonColor;
                
                // Show preview
                document.getElementById('popup-preview').classList.add('show');
            } else {
                alert('❌ Please load settings first!');
            }
        }

        // Close preview
        function closePreview() {
            document.getElementById('popup-preview').classList.remove('show');
        }

        // Test settings update
        async function testSettingsUpdate() {
            const resultDiv = document.getElementById('update-result');
            resultDiv.innerHTML = '🔄 Checking for settings updates...';
            
            const oldSettings = currentSettings ? JSON.stringify(currentSettings) : null;
            await loadCurrentSettings();
            const newSettings = JSON.stringify(currentSettings);
            
            if (oldSettings && oldSettings !== newSettings) {
                resultDiv.innerHTML = '<span class="success">✅ Settings have been updated!</span>';
            } else if (oldSettings) {
                resultDiv.innerHTML = '<span style="color: #ffc107;">⚠️ No changes detected in settings</span>';
            } else {
                resultDiv.innerHTML = '<span class="success">✅ Settings loaded for first time</span>';
            }
        }

        // Test form submission
        async function testFormSubmission() {
            const resultDiv = document.getElementById('form-result');
            resultDiv.innerHTML = '🔄 Testing form submission...';
            
            const testData = {
                email: 'test-settings-' + Date.now() + '@example.com',
                phone: '1234567890',
                discount_code: 'TEST123',
                block_id: 'test-block'
            };
            
            try {
                const response = await fetch('/api/subscribe', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Shopify-Shop-Domain': 'booksss12345.myshopify.com',
                    },
                    body: JSON.stringify(testData)
                });
                
                if (response.ok) {
                    const result = await response.json();
                    resultDiv.innerHTML = 
                        '<span class="success">✅ Form submission successful!</span><br>' +
                        'Email: ' + testData.email + '<br>' +
                        'Phone: ' + testData.phone + '<br>' +
                        'Subscriber ID: ' + result.subscriber_id;
                } else {
                    resultDiv.innerHTML = '<span class="error">❌ Form submission failed: ' + response.status + '</span>';
                }
            } catch (error) {
                resultDiv.innerHTML = '<span class="error">❌ Form submission error: ' + error.message + '</span>';
            }
        }

        // Auto-load settings on page load
        window.addEventListener('load', function() {
            testApiConnection();
            setTimeout(loadCurrentSettings, 1000);
        });
    </script>
</body>
</html>
  `;

  return new Response(html, {
    headers: {
      "Content-Type": "text/html",
    },
  });
};