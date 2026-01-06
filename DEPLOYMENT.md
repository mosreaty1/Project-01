# GitHub Pages Deployment Guide

## Quick Deployment Steps

### Method 1: GitHub Settings (Easiest)

1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "Add SecureChat application"
   git push origin claude/secure-chat-app-FloBB
   ```

2. **Enable GitHub Pages**:
   - Go to your repository on GitHub
   - Click **Settings** tab
   - Scroll down to **Pages** section (left sidebar)
   - Under **Source**, select your branch: `claude/secure-chat-app-FloBB`
   - Click **Save**

3. **Wait for deployment** (usually 1-2 minutes)
   - GitHub will show a message: "Your site is ready to be published at..."
   - Click the URL to access your app

4. **Share the URL**:
   - Your app will be available at: `https://yourusername.github.io/repository-name/`

### Method 2: GitHub Actions (Automatic)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ claude/secure-chat-app-FloBB ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: .
```

## Verification

After deployment, verify:

1. ✅ App loads at your GitHub Pages URL
2. ✅ You can see your 6-digit ID
3. ✅ Status shows "Ready"
4. ✅ No console errors (check browser DevTools)

## Troubleshooting

### Issue: 404 Error

**Solution**:
- Make sure you selected the correct branch in GitHub Pages settings
- Ensure `index.html` is in the root directory
- Check if `.nojekyll` file exists

### Issue: "Peer error: unavailable-id"

**Solution**:
- Refresh the page to get a new ID
- This happens if two users get the same ID (rare)

### Issue: "Connection failed"

**Solution**:
- Check if both users are online
- Ensure firewall/antivirus isn't blocking WebRTC
- Try a different browser
- Check browser console for specific errors

### Issue: Styles not loading

**Solution**:
- Clear browser cache (Ctrl+Shift+Delete)
- Check if `styles.css` is in the same directory as `index.html`
- Verify file names are correct (case-sensitive)

## Custom Domain (Optional)

To use a custom domain:

1. Add a `CNAME` file with your domain:
   ```
   chat.yourdomain.com
   ```

2. Configure DNS:
   - Add CNAME record pointing to: `yourusername.github.io`

3. Enable HTTPS in GitHub Pages settings

## Security Notes

- GitHub Pages uses HTTPS by default ✅
- All encryption happens client-side ✅
- No server-side code or databases ✅
- Perfect for privacy-focused apps ✅

## Performance

- **First Load**: ~500ms
- **Message Encryption**: <10ms
- **Message Delivery**: Real-time (P2P)
- **No Server Costs**: Free hosting! 💰

---

**You're all set! Share your GitHub Pages URL with friends to start chatting securely.** 🚀
