document.addEventListener('DOMContentLoaded', () => {
    // Inputs
    const msgOrig = document.getElementById('msg-orig');
    const msgMod = document.getElementById('msg-mod');
    const compareBtn = document.getElementById('compare-btn');

    // Outputs - Original
    const origSha1 = document.getElementById('orig-sha1');
    const origSha256 = document.getElementById('orig-sha256');
    const origSha512 = document.getElementById('orig-sha512');

    // Outputs - Modified
    const modSha1 = document.getElementById('mod-sha1');
    const modSha256 = document.getElementById('mod-sha256');
    const modSha512 = document.getElementById('mod-sha512');

    // Stats
    const statsSection = document.getElementById('stats-section');
    const avalanchePercent = document.getElementById('avalanche-percent');
    const statMsg = document.getElementById('stat-msg');

    /**
     * Compare two strings and highlight differences in red
     */
    function highlightDiff(strMod, strOrig) {
        if (!strOrig || !strMod) return strMod;
        
        let result = '';
        const len = Math.max(strMod.length, strOrig.length);
        let diffCount = 0;

        for (let i = 0; i < len; i++) {
            const charMod = strMod[i] || '';
            const charOrig = strOrig[i] || '';

            if (charMod !== charOrig) {
                result += `<span class="diff-char">${charMod}</span>`;
                diffCount++;
            } else {
                result += charMod;
            }
        }
        return { html: result, count: diffCount, total: len };
    }

    /**
     * Main Comparison Logic
     */
    function runComparison() {
        const textOrig = msgOrig.value;
        const textMod = msgMod.value;

        // 1. Generate Hashes for Original
        const h1Orig = CryptoJS.SHA1(textOrig).toString();
        const h256Orig = CryptoJS.SHA256(textOrig).toString();
        const h512Orig = CryptoJS.SHA512(textOrig).toString();

        // 2. Generate Hashes for Modified
        const h1Mod = CryptoJS.SHA1(textMod).toString();
        const h256Mod = CryptoJS.SHA256(textMod).toString();
        const h512Mod = CryptoJS.SHA512(textMod).toString();

        // 3. Display Original
        origSha1.textContent = h1Orig || '...';
        origSha256.textContent = h256Orig || '...';
        origSha512.textContent = h512Orig || '...';

        // 4. Analysis & Comparison
        const res1 = highlightDiff(h1Mod, h1Orig);
        const res256 = highlightDiff(h256Mod, h256Orig);
        const res512 = highlightDiff(h512Mod, h512Orig);

        // 5. Display Modified with Highlights
        modSha1.innerHTML = res1.html;
        modSha256.innerHTML = res256.html;
        modSha512.innerHTML = res512.html;

        // 6. Calculate Avalanche Percentage (using SHA-256 for standard)
        if (textOrig && textMod) {
            const percentage = ((res256.count / res256.total) * 100).toFixed(1);
            avalanchePercent.textContent = `${percentage}%`;
            statsSection.style.display = 'block';

            if (percentage > 50) {
                statMsg.textContent = "CRITICAL: Small change → Huge hash difference detected!";
                statMsg.style.color = 'var(--neon-yellow)';
            } else if (percentage > 0) {
                statMsg.textContent = "Significant hash divergence observed.";
                statMsg.style.color = 'var(--neon-cyan)';
            } else {
                statMsg.textContent = "Integrity maintained. No changes detected.";
                statMsg.style.color = 'var(--neon-green)';
            }
        } else {
            statsSection.style.display = 'none';
        }
    }

    // Trigger on button click
    compareBtn.addEventListener('click', runComparison);

    // Also trigger in real-time for better interaction
    const inputs = [msgOrig, msgMod];
    inputs.forEach(input => {
        input.addEventListener('input', runComparison);
    });
});

// --- CODE VIEW MODAL LOGIC ---
const pythonCodeALA2 = `import hashlib

def calculate_sha256(message):
    """
    Calculates the SHA-256 hash of a string.
    """
    return hashlib.sha256(message.encode()).hexdigest()

# Demonstration of the Avalanche Effect
input1 = "Cybersecurity Lab"
input2 = "cybersecurity Lab"  # Only the first letter changed (C -> c)

hash1 = calculate_sha256(input1)
hash2 = calculate_sha256(input2)

print(f"Input 1: {input1}")
print(f"Hash 1:  {hash1}")
print("-" * 64)
print(f"Input 2: {input2}")
print(f"Hash 2:  {hash2}")

# Calculate character mismatch count (Avalanche visualization)
diff = sum(1 for a, b in zip(hash1, hash2) if a != b)
total = len(hash1)
percentage = (diff / total) * 100

print("-" * 64)
print(f"Total Characters Changed: {diff}/{total} ({percentage:.2f}%)")
print("\\nConclusion: Even a 1-bit difference in input results in ")
print("a completely different hash string.")
`;

function openCodeModal() {
    const modal = document.getElementById('code-modal');
    const codeElement = document.getElementById('python-code');
    codeElement.textContent = pythonCodeALA2;
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
    navigator.clipboard.writeText(pythonCodeALA2).then(() => {
        const toast = document.getElementById('toast');
        toast.textContent = "CODE COPIED TO CLIPBOARD!";
        toast.style.display = 'block';
        setTimeout(() => toast.style.display = 'none', 2000);
    });
}

function downloadCode() {
    const blob = new Blob([pythonCodeALA2], { type: 'text/x-python' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ala2_sha_avalanche.py';
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
 * Global Copy Function for UI Hashes
 */
function copyText(elementId) {
    const text = document.getElementById(elementId).innerText;
    navigator.clipboard.writeText(text).then(() => {
        const toast = document.getElementById('toast');
        toast.textContent = "COPIED TO CLIPBOARD!";
        toast.style.display = 'block';
        setTimeout(() => {
            toast.style.display = 'none';
        }, 2000);
    });
}
