class SecureChat {
    constructor() {
        this.peer = null;
        this.connection = null;
        this.myId = null;
        this.encryptionKey = null;
        this.messages = [];
        this.recipientId = null;

        this.init();
    }

    async init() {
        await this.generateEncryptionKey();
        await this.generateUserId();
        this.setupPeer();
        this.setupEventListeners();
        this.updateStatus('Connecting...', false);
    }

    // Generate 6-digit ID based on browser fingerprint + IP hash
    async generateUserId() {
        try {
            // Get IP address from external service
            const ipResponse = await fetch('https://api.ipify.org?format=json');
            const ipData = await ipResponse.json();
            const ip = ipData.ip;

            // Create browser fingerprint
            const fingerprint = await this.getBrowserFingerprint();

            // Combine IP and fingerprint
            const combined = `${ip}-${fingerprint}`;

            // Hash to create 6-digit ID
            const hashBuffer = await crypto.subtle.digest(
                'SHA-256',
                new TextEncoder().encode(combined)
            );

            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

            // Convert to 6-digit number
            const sixDigitId = parseInt(hashHex.substring(0, 8), 16) % 1000000;
            this.myId = sixDigitId.toString().padStart(6, '0');

            document.getElementById('myUserId').textContent = this.myId;
        } catch (error) {
            console.error('Error generating user ID:', error);
            // Fallback to random ID if IP fetch fails
            this.myId = Math.floor(100000 + Math.random() * 900000).toString();
            document.getElementById('myUserId').textContent = this.myId;
        }
    }

    // Create browser fingerprint
    async getBrowserFingerprint() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('SecureChat', 2, 2);

        const fingerprint = {
            userAgent: navigator.userAgent,
            language: navigator.language,
            platform: navigator.platform,
            screenResolution: `${screen.width}x${screen.height}`,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            canvas: canvas.toDataURL(),
            hardwareConcurrency: navigator.hardwareConcurrency,
            deviceMemory: navigator.deviceMemory || 0
        };

        return JSON.stringify(fingerprint);
    }

    // Generate AES-GCM encryption key
    async generateEncryptionKey() {
        this.encryptionKey = await crypto.subtle.generateKey(
            {
                name: 'AES-GCM',
                length: 256
            },
            true,
            ['encrypt', 'decrypt']
        );
    }

    // Encrypt message
    async encryptMessage(message) {
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const encodedMessage = new TextEncoder().encode(message);

        const encryptedData = await crypto.subtle.encrypt(
            {
                name: 'AES-GCM',
                iv: iv
            },
            this.encryptionKey,
            encodedMessage
        );

        // Export key for sharing
        const exportedKey = await crypto.subtle.exportKey('raw', this.encryptionKey);

        return {
            iv: Array.from(iv),
            data: Array.from(new Uint8Array(encryptedData)),
            key: Array.from(new Uint8Array(exportedKey))
        };
    }

    // Decrypt message
    async decryptMessage(encryptedObj) {
        try {
            // Import the key
            const key = await crypto.subtle.importKey(
                'raw',
                new Uint8Array(encryptedObj.key),
                { name: 'AES-GCM' },
                false,
                ['decrypt']
            );

            const decryptedData = await crypto.subtle.decrypt(
                {
                    name: 'AES-GCM',
                    iv: new Uint8Array(encryptedObj.iv)
                },
                key,
                new Uint8Array(encryptedObj.data)
            );

            return new TextDecoder().decode(decryptedData);
        } catch (error) {
            console.error('Decryption error:', error);
            return '[Decryption failed]';
        }
    }

    // Setup PeerJS connection
    setupPeer() {
        // Use public PeerJS server
        this.peer = new Peer(this.myId, {
            debug: 2,
            config: {
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun1.l.google.com:19302' }
                ]
            }
        });

        this.peer.on('open', (id) => {
            console.log('My peer ID is: ' + id);
            this.updateStatus('Ready', true);
            this.showToast('Connected! Ready to chat securely.', 'success');
        });

        this.peer.on('connection', (conn) => {
            this.connection = conn;
            this.recipientId = conn.peer;
            this.updateChatHeader(conn.peer);
            this.showToast(`Incoming connection from ${conn.peer}`, 'info');

            // Show message input immediately for incoming connections
            document.getElementById('messageInputContainer').classList.remove('hidden');

            // Clear empty state
            const messagesContainer = document.getElementById('messagesContainer');
            messagesContainer.innerHTML = '';

            this.setupConnection();
        });

        this.peer.on('error', (err) => {
            console.error('Peer error:', err);
            this.updateStatus('Error', false);

            if (err.type === 'unavailable-id') {
                this.showToast('This ID is already in use. Please refresh the page.', 'error');
            } else {
                this.showToast('Connection error: ' + err.message, 'error');
            }
        });

        this.peer.on('disconnected', () => {
            this.updateStatus('Disconnected', false);
            this.showToast('Disconnected from server. Attempting to reconnect...', 'error');

            // Attempt to reconnect
            setTimeout(() => {
                if (!this.peer.destroyed) {
                    this.peer.reconnect();
                }
            }, 3000);
        });
    }

    // Connect to another peer
    connectToPeer(peerId) {
        if (!peerId || peerId.length !== 6) {
            this.showToast('Please enter a valid 6-digit ID', 'error');
            return;
        }

        if (peerId === this.myId) {
            this.showToast('You cannot connect to yourself', 'error');
            return;
        }

        this.showToast(`Connecting to ${peerId}...`, 'info');

        this.connection = this.peer.connect(peerId, {
            reliable: true
        });

        this.recipientId = peerId;
        this.updateChatHeader(peerId);

        // Show message input immediately for outgoing connections
        document.getElementById('messageInputContainer').classList.remove('hidden');

        // Clear empty state
        const messagesContainer = document.getElementById('messagesContainer');
        messagesContainer.innerHTML = '';

        this.setupConnection();
    }

    // Setup connection event listeners
    setupConnection() {
        this.connection.on('open', () => {
            console.log('Connection established');
            this.showToast('Connection established! You can now send encrypted messages.', 'success');

            // Ensure message input is visible (already shown, but verify)
            document.getElementById('messageInputContainer').classList.remove('hidden');
        });

        this.connection.on('data', async (data) => {
            if (data.type === 'message') {
                const decryptedMessage = await this.decryptMessage(data.encrypted);
                this.addMessage(decryptedMessage, 'received', data.timestamp);
            }
        });

        this.connection.on('close', () => {
            this.showToast('Connection closed', 'info');
            document.getElementById('messageInputContainer').classList.add('hidden');
        });

        this.connection.on('error', (err) => {
            console.error('Connection error:', err);
            this.showToast('Connection error: ' + err.message, 'error');
        });
    }

    // Send message
    async sendMessage(message) {
        if (!this.connection || !this.connection.open) {
            this.showToast('Not connected to any user', 'error');
            return;
        }

        if (!message.trim()) {
            return;
        }

        const encrypted = await this.encryptMessage(message);
        const timestamp = new Date().toISOString();

        this.connection.send({
            type: 'message',
            encrypted: encrypted,
            timestamp: timestamp
        });

        this.addMessage(message, 'sent', timestamp);
    }

    // Add message to UI
    addMessage(message, type, timestamp) {
        const messagesContainer = document.getElementById('messagesContainer');

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;

        const bubble = document.createElement('div');
        bubble.className = 'message-bubble';
        bubble.textContent = message;

        const time = document.createElement('div');
        time.className = 'message-time';
        time.textContent = new Date(timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });

        messageDiv.appendChild(bubble);
        messageDiv.appendChild(time);
        messagesContainer.appendChild(messageDiv);

        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Store message
        this.messages.push({ message, type, timestamp });
    }

    // Update chat header
    updateChatHeader(peerId) {
        const chatHeader = document.getElementById('chatHeaderContent');
        chatHeader.innerHTML = `
            <div class="chat-header-active">
                <div class="recipient-avatar">${peerId.substring(0, 2)}</div>
                <div class="recipient-info">
                    <h3>User ${peerId}</h3>
                    <p>ID: ${peerId}</p>
                </div>
            </div>
        `;
    }

    // Update status
    updateStatus(text, isConnected) {
        const statusText = document.getElementById('statusText');
        const statusDot = document.getElementById('statusDot');

        statusText.textContent = text;

        if (isConnected) {
            statusDot.classList.add('connected');
            statusDot.classList.remove('error');
        } else if (text === 'Error') {
            statusDot.classList.add('error');
            statusDot.classList.remove('connected');
        } else {
            statusDot.classList.remove('connected', 'error');
        }
    }

    // Show toast notification
    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast ${type}`;

        setTimeout(() => {
            toast.classList.add('show');
        }, 100);

        setTimeout(() => {
            toast.classList.remove('show');
        }, 4000);
    }

    // Setup event listeners
    setupEventListeners() {
        // Connect form
        document.getElementById('connectForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const recipientId = document.getElementById('recipientId').value;
            this.connectToPeer(recipientId);
        });

        // Message form
        document.getElementById('messageForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const messageInput = document.getElementById('messageInput');
            const message = messageInput.value;

            await this.sendMessage(message);
            messageInput.value = '';
            messageInput.style.height = 'auto';
        });

        // Auto-resize textarea
        const messageInput = document.getElementById('messageInput');
        messageInput.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
        });

        // Copy ID button
        document.getElementById('copyIdBtn').addEventListener('click', () => {
            const id = this.myId;
            navigator.clipboard.writeText(id).then(() => {
                this.showToast('ID copied to clipboard!', 'success');
            }).catch((err) => {
                console.error('Failed to copy:', err);
                this.showToast('Failed to copy ID', 'error');
            });
        });

        // Format recipient ID input
        document.getElementById('recipientId').addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/\D/g, '').substring(0, 6);
        });
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SecureChat();
});
