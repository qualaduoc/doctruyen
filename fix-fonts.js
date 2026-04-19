const fs = require('fs');
const path = require('path');

function replaceInFile(file, replacements) {
    let content = fs.readFileSync(file, 'utf8');
    for (const [search, replace] of replacements) {
        content = content.replaceAll(search, replace);
    }
    fs.writeFileSync(file, content);
}

const dir = 'd:/Nodejs/Audio-truyen';

// Retro 2
replaceInFile(path.join(dir, 'src/components/themes/ThemeRetro2.tsx'), [
    ["Cinzel", "Philosopher"],
    ["family=Philosopher:wght@400;700", "family=Philosopher:wght@400;700"]
]);

// Retro 3
replaceInFile(path.join(dir, 'src/components/themes/ThemeRetro3.tsx'), [
    ["Cinzel", "Philosopher"]
]);

// Retro RPG
replaceInFile(path.join(dir, 'src/components/themes/ThemeRetroRPG.tsx'), [
    ["Press_Start_2P", "Chakra_Petch"],
    ["Press Start 2P", "Chakra Petch"],
    ["VT323", "Space_Grotesk"],
    ["'VT323'", "'Space Grotesk'"],
    ["family=Press+Start+2P&family=VT323", "family=Chakra+Petch:wght@400;600;700&family=Space+Grotesk:wght@400;700"]
]);

console.log("Fonts fixed!");
