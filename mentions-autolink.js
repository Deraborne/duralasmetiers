(function () {
  const members = window.DURALAS_MEMBERS || {};

  function escapeHtml(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function makeMentionLink(rawName, originalText) {
    const url = members[rawName];
    if (!url) return originalText;
    return `<a href="${escapeHtml(url)}" class="forum-mention">${escapeHtml(originalText)}</a>`;
  }

  function transformMentions(text) {
    return text.replace(/@(?:"([^"]+)"|([A-Za-zÀ-ÿ0-9_'’\- ]+))/g, (match, quotedName, plainName) => {
      const name = (quotedName || plainName || "").trim();
      return makeMentionLink(name, match);
    });
  }

  function processElement(el) {
    el.innerHTML = transformMentions(el.innerHTML);
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".quest-members-list, .mentions-auto").forEach(processElement);
  });
})();
