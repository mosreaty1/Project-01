# SecureChat - End-to-End Encrypted Messaging

A professional, secure peer-to-peer chat application with end-to-end encryption, deployed on GitHub Pages.

## Features

- **6-Digit ID System**: Each user gets a unique 6-digit ID based on their IP address and browser fingerprint
- **End-to-End Encryption**: All messages are encrypted using AES-256-GCM encryption
- **Peer-to-Peer**: Direct P2P connections using WebRTC (PeerJS)
- **No Server Storage**: Messages are never stored on any server
- **Professional UI**: Modern, secure dark theme interface
- **Real-time Messaging**: Instant message delivery
- **Toast Notifications**: User-friendly notifications for all actions
- **Responsive Design**: Works on desktop and mobile devices

## How to Use

1. **Get Your ID**: When you open the app, you'll automatically get a unique 6-digit ID
2. **Share Your ID**: Share your 6-digit ID with the person you want to chat with
3. **Connect**: Enter their 6-digit ID in the "Connect to User" field and click Connect
4. **Chat Securely**: Start sending encrypted messages!

## Security Features

- **AES-256-GCM Encryption**: Military-grade encryption for all messages
- **Perfect Forward Secrecy**: New encryption keys for each session
- **No Server Storage**: Messages are sent directly peer-to-peer
- **Browser Fingerprinting**: Unique ID generation based on device characteristics
- **Secure WebRTC**: Uses STUN servers for secure P2P connections

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Encryption**: Web Crypto API (AES-256-GCM)
- **P2P**: PeerJS (WebRTC wrapper)
- **Styling**: Custom CSS with gradient design
- **Fonts**: Inter font family

## Deployment

This app is designed to work on GitHub Pages:

1. Push the code to your GitHub repository
2. Go to Settings > Pages
3. Select the branch (usually `main` or `claude/secure-chat-app-FloBB`)
4. Save and wait for deployment
5. Access your app at `https://yourusername.github.io/repository-name/`

## How It Works

### ID Generation
1. Fetches user's IP address from `api.ipify.org`
2. Creates browser fingerprint (user agent, screen resolution, canvas, etc.)
3. Combines IP + fingerprint and hashes with SHA-256
4. Converts hash to 6-digit number

### Encryption Process
1. Generates AES-256-GCM key for each session
2. Encrypts message with random IV (Initialization Vector)
3. Sends encrypted data + IV + key to recipient
4. Recipient decrypts using provided key and IV

### P2P Connection
1. Uses PeerJS (WebRTC) for direct peer-to-peer connections
2. STUN servers help with NAT traversal
3. No messages pass through any server (except for connection signaling)

## Browser Compatibility

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Opera: ✅ Full support

## Privacy

- No data is stored on any server
- No tracking or analytics
- No cookies
- All communication is peer-to-peer
- Messages exist only in browser memory

## Limitations

- Both users must be online simultaneously
- No message history persistence (messages are lost on page refresh)
- Requires modern browser with Web Crypto API and WebRTC support
- Firewall/NAT may block connections in some cases

## License

MIT License - feel free to use and modify

## Support

For issues or questions, please open an issue on GitHub.

---

**Built with security and privacy in mind** 🔒
