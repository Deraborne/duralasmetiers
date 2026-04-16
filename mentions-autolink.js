(function () {
  const MEMBER_LIST_URL = new URL("liste_membres.html", document.currentScript.src).href;

  function normalizeName(str) {
    return String(str || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[’‘]/g, "'")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
  }

  function buildMembersMap(doc) {
    const map = new Map();
    const rows = doc.querySelectorAll("table tbody tr");

    rows.forEach((row) => {
      const cells = row.querySelectorAll("td");
      if (cells.length < 2) return;

      const name = cells[0].textContent.trim();
      const link = cells[1].querySelector("a");
      const url = link ? link.getAttribute("href") : "";

      if (!name || !url) return;
      map.set(normalizeName(name), url);
    });

    return map;
  }

  function buildMentionLink(fullText, rawName, membersMap) {
    const url = membersMap.get(normalizeName(rawName));
    if (!url) {
      return document.createTextNode(fullText);
    }

    const a = document.createElement("a");
    a.href = url;
    a.target = "_top";
    a.className = "forum-mention";
    a.textContent = fullText;
    return a;
  }

  function processMembersList(el, membersMap) {
    const text = el.textContent.trim();
    const parts = text.split(/\s+-\s+/);
    const fragment = document.createDocumentFragment();

    parts.forEach((part, index) => {
      if (index > 0) {
        fragment.appendChild(document.createTextNode(" - "));
      }

      const cleaned = part.trim();

      // Capture un éventuel signe de ponctuation final
      const match = cleaned.match(/^@(.+?)([.,;!?])?$/);

      if (!match) {
        fragment.appendChild(document.createTextNode(cleaned));
        return;
      }

      const rawName = match[1].trim();
      const trailingPunctuation = match[2] || "";

      fragment.appendChild(buildMentionLink("@" + rawName, rawName, membersMap));

      if (trailingPunctuation) {
        fragment.appendChild(document.createTextNode(trailingPunctuation));
      }
    });

    el.innerHTML = "";
    el.appendChild(fragment);
  }

  async function initMentions() {
    try {
      const response = await fetch(MEMBER_LIST_URL, { cache: "no-store" });
      const html = await response.text();
      const doc = new DOMParser().parseFromString(html, "text/html");
      const membersMap = buildMembersMap(doc);

      document.querySelectorAll(".quest-members-list, .mentions-auto").forEach((el) => {
        processMembersList(el, membersMap);
      });
    } catch (error) {
      console.error("Impossible de charger la liste des membres :", error);
    }
  }

  document.addEventListener("DOMContentLoaded", initMentions);
})();
