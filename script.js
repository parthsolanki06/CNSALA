// Array of sample quotes
const quotes = [
    "Believe you can and you're halfway there.",
    "The only limit to our realization of tomorrow is our doubts of today.",
    "Success is not final, failure is not fatal: It is the courage to continue that counts.",
    "Don't watch the clock; do what it does. Keep going.",
    "Your time is limited, don't waste it living someone else's life."
];

// Function to generate a random quote
function generateQuote() {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const quoteDisplay = document.getElementById("quoteDisplay");
    quoteDisplay.textContent = `"${quotes[randomIndex]}"`;
}

// Function to change the background color randomly
function changeBackgroundColor() {
    const colors = ["aqua", "aquamarine", "rgb(129, 168, 226)", "bisqueF", "whitesmoke"];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    document.body.style.backgroundColor = randomColor;
}
