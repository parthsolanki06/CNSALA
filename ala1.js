document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const genKeysBtn = document.getElementById('gen-keys-btn');
    const genText = document.getElementById('gen-text');
    const genLoader = document.getElementById('gen-loader');
    
    const pubKeyDisplay = document.getElementById('pub-key-display');
    const privKeyDisplay = document.getElementById('priv-key-display');
    
    const messageInput = document.getElementById('message-input');
    const signBtn = document.getElementById('sign-btn');
    const signatureDisplay = document.getElementById('signature-display');
    
    const verifyBtn = document.getElementById('verify-btn');
    const tamperBtn = document.getElementById('tamper-btn');
    const verifyResult = document.getElementById('verify-result');

    // State
    let currentKeyPair = null;
    let currentSignature = null;
    let encodedMessage = null;

    /**
     * Convert ArrayBuffer to Base64 String
     */
    function arrayBufferToBase64(buffer) {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }

    /**
     * Generate RSA Key Pair
     */
    async function generateKeys() {
        genText.style.display = 'none';
        genLoader.style.display = 'flex';
        genKeysBtn.disabled = true;

        try {
            const keyPair = await window.crypto.subtle.generateKey(
                {
                    name: "RSA-PSS",
                    modulusLength: 2048,
                    publicExponent: new Uint8Array([1, 0, 1]),
                    hash: "SHA-256",
                },
                true,
                ["sign", "verify"]
            );

            currentKeyPair = keyPair;

            // Export for display
            const exportedPub = await window.crypto.subtle.exportKey("spki", keyPair.publicKey);
            const exportedPriv = await window.crypto.subtle.exportKey("pkcs8", keyPair.privateKey);

            pubKeyDisplay.textContent = arrayBufferToBase64(exportedPub).substring(0, 120) + '...';
            privKeyDisplay.textContent = 'MIIEvAIBADANBgkqhkiG9w0BAQEFAASC...[HIDDEN]';

            // Enable next steps
            signBtn.disabled = false;
        } catch (err) {
            console.error("Key Gen Error:", err);
            alert("Failed to generate keys.");
        } finally {
            genText.style.display = 'inline';
            genLoader.style.display = 'none';
            genKeysBtn.disabled = false;
        }
    }

    /**
     * Sign Message
     */
    async function signMessage() {
        const message = messageInput.value;
        if (!message) {
            alert("Please enter a message!");
            return;
        }

        try {
            const encoder = new TextEncoder();
            encodedMessage = encoder.encode(message);

            const signature = await window.crypto.subtle.sign(
                {
                    name: "RSA-PSS",
                    saltLength: 32,
                },
                currentKeyPair.privateKey,
                encodedMessage
            );

            currentSignature = signature;
            signatureDisplay.textContent = arrayBufferToBase64(signature);

            // Enable verify
            verifyBtn.disabled = false;
            tamperBtn.disabled = false;
            verifyResult.style.display = 'none';
        } catch (err) {
            console.error("Signing Error:", err);
            alert("Failed to sign message.");
        }
    }

    /**
     * Verify Signature
     */
    async function verifySignature() {
        if (!currentSignature || !encodedMessage) return;

        try {
            // Re-encode message in case user edited it
            const encoder = new TextEncoder();
            const messageToVerify = encoder.encode(messageInput.value);

            const isValid = await window.crypto.subtle.verify(
                {
                    name: "RSA-PSS",
                    saltLength: 32,
                },
                currentKeyPair.publicKey,
                currentSignature,
                messageToVerify
            );

            verifyResult.style.display = 'block';
            if (isValid) {
                verifyResult.textContent = "✅ VALID SIGNATURE";
                verifyResult.className = "result-status status-valid";
            } else {
                verifyResult.textContent = "❌ INVALID SIGNATURE / TAMPERED";
                verifyResult.className = "result-status status-invalid";
            }
        } catch (err) {
            console.error("Verification Error:", err);
            verifyResult.textContent = "❌ VERIFICATION FAILED";
            verifyResult.className = "result-status status-invalid";
            verifyResult.style.display = 'block';
        }
    }

    /**
     * Tamper Message
     */
    function tamperMessage() {
        const msg = messageInput.value;
        if (msg.length > 0) {
            // Change one character or add something
            messageInput.value = msg + " [ALtered]";
            verifyResult.style.display = 'none';
        }
    }

    // Event Listeners
    genKeysBtn.addEventListener('click', generateKeys);
    signBtn.addEventListener('click', signMessage);
    verifyBtn.addEventListener('click', verifySignature);
    tamperBtn.addEventListener('click', tamperMessage);

    // Initialize with a key pair
    generateKeys();
});

// --- CODE VIEW MODAL LOGIC ---
const pythonCodeALA1 = `from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import rsa, padding

# 1. Generate Key Pair
private_key = rsa.generate_private_key(
    public_exponent=65537,
    key_size=2048
)
public_key = private_key.public_key()

# 2. Message to Sign
message = b"Hello, this is a secure transmission."

# 3. Sign the Message (Private Key)
signature = private_key.sign(
    message,
    padding.PSS(
        mgf=padding.MGF1(hashes.SHA256()),
        salt_length=padding.PSS.MAX_LENGTH
    ),
    hashes.SHA256()
)

# 4. Verify the Signature (Public Key)
try:
    public_key.verify(
        signature,
        message,
        padding.PSS(
            mgf=padding.MGF1(hashes.SHA256()),
            salt_length=padding.PSS.MAX_LENGTH
        ),
        hashes.SHA256()
    )
    print("Verification Result: Valid Signature")
except Exception as e:
    print(f"Verification Result: Invalid Signature ({e})")
`;

function openCodeModal() {
    const modal = document.getElementById('code-modal');
    const codeElement = document.getElementById('python-code');
    codeElement.textContent = pythonCodeALA1;
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
    navigator.clipboard.writeText(pythonCodeALA1).then(() => {
        const toast = document.getElementById('toast');
        toast.textContent = "CODE COPIED TO CLIPBOARD!";
        toast.style.display = 'block';
        setTimeout(() => toast.style.display = 'none', 2000);
    });
}

function downloadCode() {
    const blob = new Blob([pythonCodeALA1], { type: 'text/x-python' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ala1_digital_signature.py';
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
 * Copy Utility for UI Keys
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
