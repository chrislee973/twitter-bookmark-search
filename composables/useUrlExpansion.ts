export function useUrlExpansion() {
  function expandUrls(
    text: string,
    links: { shortUrl: string; expandedUrl: string }[] | undefined
  ) {
    if (!links || links.length === 0) return text;

    let expandedText = text;
    links.forEach((link) => {
      // Use a global regex to replace all occurrences
      const regex = new RegExp(escapeRegExp(link.shortUrl), "g");
      expandedText = expandedText.replace(regex, link.expandedUrl);
    });

    return expandedText;
  }

  function escapeRegExp(string: string) {
    /*
    Escape special characters in a string so that they aren't interpreted as regex characters
    This is crucial because URLs often contain characters that have special meaning in regular expressions (like dots, question marks, parentheses, etc.). Without escaping these characters, the regex would behave incorrectly.
    For example:
    A URL like "https://t.co/abc?123" contains "?" which in regex means "optional preceding character"
    Without escaping, trying to replace this would cause regex errors
    */
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  return { expandUrls };
}
