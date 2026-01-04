const fs = require('fs');

const paper = JSON.parse(fs.readFileSync('data/papers/5zXfjixq-N.json', 'utf8'));
const text = paper.sections[0].originalContent;

console.log("Text sample:", text.substring(0, 500));

// Old regex
const oldRegex = /(?:^|\n)(?:\d+\.?\s+)?(Abstract|Introduction|Background|Methods?|Methodology|Results?|Discussion|Conclusion|References)[\s:]*\n/gi;
console.log("\nOld Regex Matches:", [...text.matchAll(oldRegex)].length);

// New proposed regex: Allow space/colon instead of strict newline
const newRegex = /(?:^|\n)(?:\d+\.?\s+)?(Abstract|Introduction|Background|Methods?|Methodology|Results?|Discussion|Conclusion|References)(?:[\s:.]+(?=[A-Z])|$)/gi;

const matches = [...text.matchAll(newRegex)];
console.log("New Regex Matches:", matches.length);

matches.forEach(m => {
    console.log(`Found: "${m[1]}" at index ${m.index}`);
});
