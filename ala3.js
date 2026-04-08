async function runPythonCode() {
    const keyStr = document.getElementById("shared-key").value || "default_key";
    const msgSend = document.getElementById("msg-send").value || "";
    const msgRecv = document.getElementById("msg-recv").value || "";
    const output = document.getElementById("output");
    
    output.style.color = "#00ff00"; // Reset terminal color

    try {
        let text = `===== HMAC Authentication Simulator =====\n\n`;
        text += `[Network] Using Shared Secret Key: "${keyStr}"\n\n`;
        
        text += `[Sender] Original Message: "${msgSend}"\n`;
        text += `[Sender] Calculating MAC (HMAC-SHA256)...\n`;

        // Convert key and message to array buffers
        const enc = new TextEncoder();
        
        // Import the key
        const cryptoKey = await crypto.subtle.importKey(
            "raw", enc.encode(keyStr),
            { name: "HMAC", hash: "SHA-256" },
            false, ["sign", "verify"]
        );

        // Generate MAC
        const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, enc.encode(msgSend));
        const hashArray = Array.from(new Uint8Array(signatureBuffer));
        const macHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        
        text += `[Sender] Generated MAC: ${macHex}\n`;
        
        text += `\n------------------------------------------------\n`;
        text += ` 📡 Transmitting Message & MAC over network... \n`;
        text += `------------------------------------------------\n\n`;
        
        text += `[Receiver] Incoming Message: "${msgRecv}"\n`;
        text += `[Receiver] Incoming MAC: ${macHex.substring(0,16)}...${macHex.substring(macHex.length-8)}\n\n`;
        
        text += `[Receiver] Independently calculating MAC from received message...\n`;
        
        // Receiver generates their own MAC using the received message and shared key
        const receiverSignature = await crypto.subtle.sign("HMAC", cryptoKey, enc.encode(msgRecv));
        const receiverHashArray = Array.from(new Uint8Array(receiverSignature));
        const receiverMacHex = receiverHashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        
        text += `[Receiver] Expected MAC:  ${macHex.substring(0,16)}...\n`;
        text += `[Receiver] Calculated MAC: ${receiverMacHex.substring(0,16)}...\n`;
        
        // In SubtleCrypto, we'd use verify, but to show the string match visually:
        const isValid = await crypto.subtle.verify("HMAC", cryptoKey, signatureBuffer, enc.encode(msgRecv));

        if (isValid) {
            text += `\n✅ Success: MACs Match!\n`;
            text += `Authentication & Integrity Verified. The message is completely authentic.`;
            output.style.color = "#00ff00";
        } else {
            text += `\n❌ Warning: MACs Do NOT Match!\n`;
            text += `Verification Failed! The message was likely tampered with or forged.`;
            output.style.color = "#ff5f56"; // Red warning color
        }

        output.innerText = text;
    } catch (err) {
        output.innerText = "Error encountered:\n" + err;
        output.style.color = "#ff5f56";
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
            link.download = 'hmac_execution_output.png';
            link.href = canvas.toDataURL();
            link.click();
        });
    }, 150);
}

// Trigger initial run on load
window.addEventListener('DOMContentLoaded', runPythonCode);
