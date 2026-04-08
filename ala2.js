async function getHashHex(algo, text) {
    const msgBuffer = new TextEncoder().encode(text);
    const hashBuffer = await crypto.subtle.digest(algo, msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function get_hashes(text) {
    const sha1 = await getHashHex('SHA-1', text);
    const sha256 = await getHashHex('SHA-256', text);
    const sha512 = await getHashHex('SHA-512', text);
    return [sha1, sha256, sha512];
}

function compare_hashes(h1, h2) {
    let diff = 0;
    for (let i = 0; i < h1.length; i++) {
        if (h1[i] !== h2[i]) diff++;
    }
    return diff;
}

async function runPythonCode() {
    const msg1 = document.getElementById("msg-input1").value || "Hello";
    const msg2 = document.getElementById("msg-input2").value || "Hello!";
    const output = document.getElementById("output");
    output.style.color = "#00ff00";

    try {
        const [sha1_1, sha256_1, sha512_1] = await get_hashes(msg1);
        const [sha1_2, sha256_2, sha512_2] = await get_hashes(msg2);

        let text = `===== SHA Integrity Analyzer =====\n`;
        text += `Enter original text: ${msg1}\n`;
        text += `Enter modified text (slight change): ${msg2}\n`;

        text += `\n--- Avalanche Effect Demonstration ---\n`;

        text += `\nOriginal Input:\n`;
        text += `\nInput Text: ${msg1}\n`;
        text += `SHA-1   : ${sha1_1}\n`;
        text += `SHA-256 : ${sha256_1}\n`;
        text += `SHA-512 : ${sha512_1}\n`;

        text += `\nModified Input (small change):\n`;
        text += `\nInput Text: ${msg2}\n`;
        text += `SHA-1   : ${sha1_2}\n`;
        text += `SHA-256 : ${sha256_2}\n`;
        text += `SHA-512 : ${sha512_2}\n`;

        text += `\nObservation:\n`;
        text += `Even a small change in input produces completely different hash outputs.\n`;

        output.innerText = text;
    } catch (err) {
        output.innerText = "Error encountered:\n" + err;
        output.style.color = "red";
    }
}

// Capture and download the terminal node as an image
function downloadOutput() {
    const terminal = document.getElementById('terminal-wrapper');

    const prevOv = terminal.style.overflowY;
    const prevHeight = terminal.style.height;
    terminal.style.overflowY = 'visible';
    terminal.style.height = terminal.scrollHeight + 'px';

    setTimeout(() => {
        html2canvas(terminal, {
            backgroundColor: "#1e1e1e",
            scale: 2
        }).then(canvas => {
            terminal.style.overflowY = prevOv;
            terminal.style.height = prevHeight;
            let link = document.createElement('a');
            link.download = 'sha_execution_output.png';
            link.href = canvas.toDataURL();
            link.click();
        });
    }, 150);
}

// Trigger initial run on load
window.addEventListener('DOMContentLoaded', runPythonCode);
