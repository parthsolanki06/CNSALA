document.addEventListener('DOMContentLoaded', () => {
    // Elements - Sender
    const messageInput = document.getElementById('message-input');
    const keyInput = document.getElementById('key-input');
    const generateBtn = document.getElementById('generate-btn');
    const senderResult = document.getElementById('sender-result');
    const generatedMacDisplay = document.getElementById('generated-mac');
    const senderLoading = document.getElementById('sender-loading');
    
    // Elements - Receiver
    const receivedMessage = document.getElementById('received-message');
    const verifyKey = document.getElementById('verify-key');
    const verifyBtn = document.getElementById('verify-btn');
    const receiverResult = document.getElementById('receiver-result');
    const verificationStatus = document.getElementById('verification-status');
    const verificationMac = document.getElementById('verification-mac');
    const receiverLoading = document.getElementById('receiver-loading');

    // State
    let originalMac = '';

    // Error elements
    const msgError = document.getElementById('msg-error');
    const keyError = document.getElementById('key-error');

    /**
     * Generate HMAC
     */
    generateBtn.addEventListener('click', () => {
        const message = messageInput.value.trim();
        const key = keyInput.value.trim();

        // Validation
        let hasError = false;
        if (!message) {
            msgError.style.display = 'block';
            hasError = true;
        } else {
            msgError.style.display = 'none';
        }

        if (!key) {
            keyError.style.display = 'block';
            hasError = true;
        } else {
            keyError.style.display = 'none';
        }

        if (hasError) return;

        // Visual feedback
        generateBtn.querySelector('span').textContent = 'Computing...';
        senderLoading.style.display = 'inline-block';
        senderResult.style.display = 'none';

        // Simulate computation time
        setTimeout(() => {
            try {
                // HMAC SHA-256 calculation
                const hmac = CryptoJS.HmacSHA256(message, key);
                originalMac = hmac.toString(CryptoJS.enc.Hex);

                // Update UI
                generatedMacDisplay.textContent = originalMac;
                senderResult.style.display = 'block';
                
                // Auto-fill receiver side to simulate "sending"
                receivedMessage.value = message;
                verifyKey.value = key;

                // Reset button
                generateBtn.querySelector('span').textContent = 'Generate MAC';
                senderLoading.style.display = 'none';

                // Flash animation
                senderResult.style.animation = 'none';
                senderResult.offsetHeight; // trigger reflow
                senderResult.style.animation = 'fadeInUp 0.5s ease';
            } catch (error) {
                console.error("Encryption Error:", error);
                alert("An error occurred during MAC generation.");
                senderLoading.style.display = 'none';
                generateBtn.querySelector('span').textContent = 'Generate MAC';
            }
        }, 800);
    });

    /**
     * Verify HMAC
     */
    verifyBtn.addEventListener('click', () => {
        if (!originalMac) {
            alert("Please generate a MAC from the sender side first!");
            return;
        }

        const msg = receivedMessage.value.trim();
        const key = verifyKey.value.trim();

        // Visual feedback
        verifyBtn.querySelector('span').textContent = 'Verifying...';
        receiverLoading.style.display = 'inline-block';
        receiverResult.style.display = 'none';

        setTimeout(() => {
            // Recompute HMAC on receiver side
            const currentHmac = CryptoJS.HmacSHA256(msg, key).toString(CryptoJS.enc.Hex);
            
            verificationMac.textContent = `Current Hash: ${currentHmac.substring(0, 32)}...`;
            receiverResult.style.display = 'block';

            if (currentHmac === originalMac) {
                verificationStatus.innerHTML = '<i class="fas fa-check-circle"></i> Authentic';
                verificationStatus.className = 'verification-status status-authentic';
                receiverResult.style.borderLeftColor = 'var(--neon-green)';
            } else {
                verificationStatus.innerHTML = '<i class="fas fa-times-circle"></i> Tampered / Invalid Key';
                verificationStatus.className = 'verification-status status-tampered';
                receiverResult.style.borderLeftColor = 'var(--neon-red)';
            }

            // Reset button
            verifyBtn.querySelector('span').textContent = 'Verify MAC';
            receiverLoading.style.display = 'none';
            
            // Flash animation
            receiverResult.style.animation = 'none';
            receiverResult.offsetHeight; // trigger reflow
            receiverResult.style.animation = 'fadeInUp 0.5s ease';
        }, 800);
    });
});

// --- CODE VIEW MODAL LOGIC ---
const pythonCodeALA3 = `import hmac
import hashlib

def generate_hmac(key, message):
    """
    Generates an HMAC-SHA256 signature for a message using a secret key.
    """
    return hmac.new(key.encode(), message.encode(), hashlib.sha256).hexdigest()

def verify_hmac(key, message, received_mac):
    """
    Verifies that the received HMAC matches the calculated HMAC.
    """
    calculated_mac = generate_hmac(key, message)
    return hmac.compare_digest(calculated_mac, received_mac)

# 1. Setup shared secret and message
secret_key = "university-ala-secret-key"
transmission = "Request: Transfer $500.00 to account 12345"

# 2. Sender side: Generate the MAC
mac = generate_hmac(secret_key, transmission)
print(f"Message: {transmission}")
print(f"Generated HMAC: {mac}")

# 3. Receiver side: Verification
print("-" * 64)
# Success case (No tampering)
is_authentic = verify_hmac(secret_key, transmission, mac)
print(f"Verification (Original): {'✅ SUCCESS' if is_authentic else '❌ FAILED'}")

# Tamper case (Changing one character)
tampered_message = transmission + "!"
is_authentic_tamper = verify_hmac(secret_key, tampered_message, mac)
print(f"Verification (Tampered): {'✅ SUCCESS' if is_authentic_tamper else '❌ FAILED'}")
`;

function openCodeModal() {
    const modal = document.getElementById('code-modal');
    const codeElement = document.getElementById('python-code');
    codeElement.textContent = pythonCodeALA3;
    modal.style.display = 'block';
    
    // Trigger Prism highlighting
    if (window.Prism) {
        Prism.highlightElement(codeElement);
    }
}

function closeCodeModal() {
    document.getElementById('code-modal').style.display = 'none';
}

function copyCode() {
    navigator.clipboard.writeText(pythonCodeALA3).then(() => {
        const toast = document.getElementById('toast');
        toast.textContent = "CODE COPIED TO CLIPBOARD!";
        toast.style.display = 'block';
        setTimeout(() => toast.style.display = 'none', 2000);
    });
}

function downloadCode() {
    const blob = new Blob([pythonCodeALA3], { type: 'text/x-python' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ala3_hmac_auth.py';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('code-modal');
    if (event.target == modal) {
        closeCodeModal();
    }
}

/**
 * Copy Utility for UI MACs
 */
function copyToClipboard(id) {
    const text = document.getElementById(id).innerText;
    navigator.clipboard.writeText(text).then(() => {
        const toast = document.getElementById('toast');
        toast.textContent = "COPIED TO CLIPBOARD!";
        toast.style.display = 'block';
        setTimeout(() => toast.style.display = 'none', 2000);
    });
}
