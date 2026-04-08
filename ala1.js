function is_prime(n) {
    if (n < 2n) return false;
    for (let i = 2n; i * i <= n; i++) {
        if (n % i === 0n) return false;
    }
    return true;
}

function generate_prime() {
    while (true) {
        let num = BigInt(Math.floor(Math.random() * 200) + 100);
        if (is_prime(num)) return num;
    }
}

function gcd(a, b) {
    while (b !== 0n) {
        let temp = b;
        b = a % b;
        a = temp;
    }
    return a;
}

function mod_inverse(e, phi) {
    for (let d = 1n; d < phi; d++) {
        if ((d * e) % phi === 1n) return d;
    }
    return null;
}

function modPow(base, exponent, modulus) {
    if (modulus === 1n) return 0n;
    let result = 1n;
    base = base % modulus;
    while (exponent > 0n) {
        if (exponent % 2n === 1n) result = (result * base) % modulus;
        exponent = exponent >> 1n;
        base = (base * base) % modulus;
    }
    return result;
}

async function hash_message(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return BigInt('0x' + hashHex);
}

async function runPythonCode() {
    const msg = document.getElementById("msg-input").value || "Test Message";
    const output = document.getElementById("output");
    output.style.color = "#00ff00"; // Reset terminal color

    try {
        let p = generate_prime();
        let q = generate_prime();
        while (q === p) q = generate_prime();
        let n = p * q;
        let phi = (p - 1n) * (q - 1n);

        let e = 2n;
        let randMax = Number(phi - 1n);
        while (true) {
            e = BigInt(Math.floor(Math.random() * (randMax - 2)) + 2);
            if (gcd(e, phi) === 1n) break;
        }
        let d = mod_inverse(e, phi);

        let text = `[INITIALIZING CRYPTO ENGINE...]\n`;
        text += `--------------------------------------\n`;
        text += `Student Name: PARTH SOLANKI\n`;
        text += `Enrollment  : 20230905090038\n`;
        text += `Activity    : ALA-1 (Digital Signature)\n`;
        text += `--------------------------------------\n\n`;
        
        text += `🔑 Generating Key Pair...\n`;
        text += `   Public Key  : (${e}, ${n})\n`;
        text += `   Private Key : (${d}, ${n})\n\n`;
        
        text += `📝 Input Message : "${msg}"\n`;
        
        let hashed = await hash_message(msg);
        text += `🔢 SHA-256 Hash : ${hashed.toString(16).substring(0, 32)}...\n\n`;
        
        let signature = modPow(hashed, d, n);
        text += `✍️ Generated Digital Signature:\n   ${signature}\n\n`;

        let verify_hashed = await hash_message(msg);
        let decrypted = modPow(signature, e, n);

        text += `🔍 Verifying Signature...\n`;
        if ((verify_hashed % n) === decrypted) {
            text += `✅ VERIFICATION SUCCESSFUL\n`;
            text += `   Message Integrity: GUARANTEED\n`;
        } else {
            text += `❌ VERIFICATION FAILED\n`;
            text += `   Message Integrity: COMPROMISED\n`;
        }

        output.innerText = text;
    } catch (err) {
        output.innerText = "Error encountered:\n" + err;
        output.style.color = "red";
    }
}

// Capture and download the terminal node as an image
function downloadOutput() {
    const terminal = document.getElementById('terminal-wrapper');

    // Temporarily fix styles for capturing
    const prevOv = terminal.style.overflowY;
    const prevHeight = terminal.style.height;
    terminal.style.overflowY = 'visible';
    terminal.style.height = terminal.scrollHeight + 'px';

    setTimeout(() => {
        html2canvas(terminal, {
            backgroundColor: "#1e1e1e",
            scale: 2 // High Resolution capture
        }).then(canvas => {
            terminal.style.overflowY = prevOv; // Restore
            terminal.style.height = prevHeight; // Restore
            let link = document.createElement('a');
            link.download = 'rsa_execution_output.png';
            link.href = canvas.toDataURL();
            link.click();
        });
    }, 150);
}

// Trigger initial run on load
window.addEventListener('DOMContentLoaded', runPythonCode);
