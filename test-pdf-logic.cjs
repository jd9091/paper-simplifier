
const assert = require('assert');

// Mock function representing the FIXED logic in lib/pdf-processor.ts
function extractTextFromPage(pageData) {
    if (!pageData.Texts) return '';

    // Sort texts by Y then X
    const texts = [...pageData.Texts].sort((a, b) => {
        if (Math.abs(a.y - b.y) > 0.5) return a.y - b.y;
        return a.x - b.x;
    });

    let text = '';
    let lastY = -1;

    for (const textItem of texts) {
        // FIXED IMPLEMENTATION: join(' ') to insert spaces between runs in the same item
        const itemText = textItem.R.map(run => decodeURIComponent(run.T)).join(' ');

        if (itemText.trim().length === 0) continue;

        // Check for new line
        if (lastY !== -1 && Math.abs(textItem.y - lastY) > 0.5) {
            text += '\n';
        } else if (text.length > 0 && !text.endsWith('\n')) {
            text += ' ';
        }

        text += itemText;
        lastY = textItem.y;
    }
    return text;
}

// Test Data
const mockPage = {
    Texts: [
        // Line 1: "Internet is" (y=5) - Two separate runs in one item, needs space joining
        { y: 5, x: 1, R: [{ T: "Internet" }, { T: "is" }] },
        // Line 1 cont: " one" (y=5) - Separate item, needs space prepending
        { y: 5, x: 10, R: [{ T: "one" }] },
        // Line 2: "Abstract" (y=2) - Out of order
        { y: 2, x: 1, R: [{ T: "Abstract" }] },
    ]
};

console.log("Running PDF Extraction Logic Test...");

const result = extractTextFromPage(mockPage);
console.log("\nResult:\n" + JSON.stringify(result));

const expected = "Abstract\nInternet is one";
console.log("\nExpected:\n" + JSON.stringify(expected));

if (result === expected) {
    console.log("\n✅ Test Passed.");
} else {
    console.log("\n❌ Test Failed: Output does not match expected.");
    process.exit(1);
}
