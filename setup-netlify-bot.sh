#!/bin/bash

echo "🍔 Setting up Telegram Bot with Netlify Functions..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Make sure you're in the BurgerGame directory."
    exit 1
fi

# Install the new dependency
echo "📦 Installing grammy dependency..."
npm install grammy@^1.36.3

# Create a simple webhook setup page
echo "🌐 Creating webhook setup page..."
cat > public/setup-webhook.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>Bot Setup</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
        .button { background: #0088cc; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; }
        .success { color: green; }
        .error { color: red; }
    </style>
</head>
<body>
    <h1>🤖 Telegram Bot Setup</h1>
    <p>Click the button below to set up the webhook for your Telegram bot:</p>
    
    <button class="button" onclick="setupWebhook()">Setup Webhook</button>
    
    <div id="result"></div>
    
    <script>
        async function setupWebhook() {
            const resultDiv = document.getElementById('result');
            resultDiv.innerHTML = 'Setting up webhook...';
            
            try {
                const response = await fetch('/.netlify/functions/telegram-bot', {
                    method: 'GET'
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    resultDiv.innerHTML = '<p class="success">✅ Webhook set up successfully!</p>';
                } else {
                    resultDiv.innerHTML = '<p class="error">❌ Error: ' + data.error + '</p>';
                }
            } catch (error) {
                resultDiv.innerHTML = '<p class="error">❌ Error: ' + error.message + '</p>';
            }
        }
    </script>
</body>
</html>
EOF

echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Build and deploy to Netlify: npm run build"
echo "2. Set BOT_TOKEN environment variable in Netlify dashboard"
echo "3. Visit https://your-site.netlify.app/setup-webhook.html to setup webhook"
echo "4. Configure BotFather with your Netlify URL"
echo ""
echo "🔗 Your bot function will be available at:"
echo "   https://your-site.netlify.app/.netlify/functions/telegram-bot"
