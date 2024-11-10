const fs = require("fs");

function escapeCodeForTemplateLiteral(code) {
  return code
    .replace(/\\/g, "\\\\")
    .replace(/`/g, "\\`")
    .replace(/\${/g, "\\${");
}

fs.readFile("scripts/bookmarks.js", "utf8", (err, data) => {
  if (err) {
    console.error("Error reading file:", err);
    return;
  }

  // Create the manual copy+paste version (escaped code)
  const escapedCode = escapeCodeForTemplateLiteral(data);
  const manualExportScript = `export const escapedCode = \`${escapedCode}\`;`;

  // Create the bookmarklet version
  const bookmarkletCode = `javascript:(function(){${escapedCode}})();`;
  const bookmarkletScript = `export const bookmarkletCode = encodeURI(\`${bookmarkletCode}\`);`;

  // Write the manual copy+paste version
  fs.writeFile("composables/exportScripts.js", manualExportScript, (err) => {
    if (err) {
      console.error("❌ Error writing manual export script:", err);
      return;
    }
    console.log(
      "✅ Manual export script has been saved to composables/exportScripts.js"
    );

    // Write the bookmarklet version
    fs.appendFile(
      "composables/exportScripts.js",
      "\n\n" + bookmarkletScript,
      (err) => {
        if (err) {
          console.error("❌ Error writing bookmarklet script:", err);
          return;
        }
        console.log(
          "✅ Bookmarklet script has been appended to composables/exportScripts.js"
        );
      }
    );
  });
});
