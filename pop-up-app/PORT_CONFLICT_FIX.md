# 🔧 Port Conflict Fix - EADDRINUSE Error

## ✅ **Issue Identified**
You're getting `Error: listen EADDRINUSE: address already in use 127.0.0.1:9293` because your Shopify development server is already running.

## 🚀 **Current Status**
- ✅ **Shopify app dev server is RUNNING** (PID: 47118)
- ✅ **Your app is accessible** on the ports shown in Terminal 1
- ✅ **Popup extension is deployed** and ready

## 🛠️ **Solutions**

### **Option 1: Use Your Current Running Server (Recommended)**
Your development server is already running perfectly! Just use it:

1. **Check Terminal 1** for the Preview URL
2. **Go to your Shopify admin** using that URL
3. **Enable the popup** in theme customizer (see POPUP_INSTALLATION_GUIDE.md)

### **Option 2: If You Need to Restart the Server**
If you need to restart for any reason:

1. **Stop the current server:**
   ```bash
   kill 47118
   ```
   Or press `Ctrl+C` in Terminal 1

2. **Wait 10 seconds** for ports to be released

3. **Restart the server:**
   ```bash
   shopify app dev
   ```

### **Option 3: If Port Still Conflicts**
If port 9293 is still in use after stopping:

1. **Find what's using the port:**
   ```bash
   lsof -i :9293
   ```

2. **Kill the process:**
   ```bash
   kill -9 <PID>
   ```

3. **Restart your app:**
   ```bash
   shopify app dev
   ```

## 🎯 **Next Steps**
Since your server is running, focus on enabling the popup:

1. ✅ **Server is running** - No action needed
2. 🔄 **Enable popup in theme** - Follow POPUP_INSTALLATION_GUIDE.md
3. 🧪 **Test the popup** - Visit your storefront

## 💡 **Pro Tip**
You don't need to restart the server. The popup extension was already updated successfully when you saw:
```
Draft updated successfully for extension: discount-popup
```

Your popup is ready to work - just enable it in your theme!