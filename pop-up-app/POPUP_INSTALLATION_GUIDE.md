# 🚀 Popup Installation Guide - Fix "Popup Not Showing" Issue

## ✅ **Issue Identified**
Your popup is not displaying on the storefront because the **Theme App Extension needs to be enabled** in your Shopify theme.

## 🔧 **Solution: Enable the Popup Extension**

### **Step 1: Access Your Development Store**
1. Click the **Preview URL** from your terminal:
   ```
   https://booksss12345.myshopify.com/admin/oauth/redirect_from_cli?client_id=0101df2c30b27d14adad2624b4f30e69
   ```

### **Step 2: Go to Theme Customizer**
1. In your Shopify admin, go to **Online Store > Themes**
2. Click **Customize** on your active theme

### **Step 3: Add the App Embed Block**
1. In the theme customizer, look for **App embeds** section (usually at the bottom left)
2. Find **"Discount Pop-up"** in the available app embeds
3. **Toggle it ON** to enable the popup
4. **Save** your theme changes

### **Step 4: Configure Popup Settings (Optional)**
1. While still in the theme customizer, you can configure:
   - **Enable Pop-up**: Make sure it's checked ✅
   - **Pop-up Title**: "Get 10% Off Your First Order!"
   - **Description**: "Enter your email to receive an exclusive discount code"
   - **Position**: Center, Right Side, Left Side, or Bottom Right
   - **Trigger**: Page load, Exit intent, Time delay, or Scroll
   - **Colors**: Background, text, and button colors

### **Step 5: Test the Popup**
1. **Save** all changes in the theme customizer
2. **Visit your storefront** (not the admin)
3. The popup should appear based on your trigger settings (default: 5 seconds after page load)

## 🎯 **Alternative: Use App Settings**
You can also configure the popup through your app's admin interface:
1. Go to **Apps** in your Shopify admin
2. Open your **Pop-up App**
3. Click **Pop-up Settings**
4. Configure all settings there

## 🐛 **If Popup Still Doesn't Show**

### **Check These Common Issues:**

1. **App Embed Not Enabled**
   - Make sure the "Discount Pop-up" app embed is toggled ON in theme customizer

2. **Popup Disabled in Settings**
   - Check that "Enable Pop-up" is checked in your app settings

3. **Frequency Settings**
   - If set to "Once per session", clear your browser cookies/localStorage
   - Or change to "Every visit" for testing

4. **Trigger Settings**
   - If using "Exit intent", try moving your mouse to the top of the browser
   - If using "Scroll", scroll down the page
   - If using "Time delay", wait for the specified seconds

5. **Browser Console Errors**
   - Open browser developer tools (F12)
   - Check for any JavaScript errors in the console

## ✅ **Expected Result**
After enabling the app embed, you should see:
- ✅ Popup appears on storefront based on trigger settings
- ✅ Email collection form works
- ✅ Discount codes are generated
- ✅ Subscriber data is stored in your app database

## 🎉 **Success Indicators**
- Popup displays with your custom styling
- Form submission works without CORS errors
- Discount codes are generated (format: POPUP + 6 random characters)
- Emails are stored in your database (check Pop-up Settings > Subscribers tab)

---

**The popup extension is now updated with the correct API endpoint (port 58042). Once you enable the app embed in your theme, the popup should work perfectly!**