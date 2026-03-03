import Papa from "papaparse";

export interface PasswordEntry {
  site: string;
  domain: string;
  username: string;
  password: string;
}

function detectColumn(columns: string[], keywords: string[]): string | null {
  for (const key of keywords) {
    for (const col of columns) {
      if (col.includes(key)) return col;
    }
  }
  return null;
}

function extractSiteInfo(url: string): { site: string; domain: string } {
  try {
    const cleaned = url.startsWith("http") ? url : `https://${url}`;
    const hostname = new URL(cleaned).hostname;
    const parts = hostname.replace("www.", "").split(".");
    const site = parts[0] ? parts[0].charAt(0).toUpperCase() + parts[0].slice(1) : "Unknown";
    const domain = parts.length >= 2 ? parts.slice(-2).join(".") : hostname;
    return { site, domain };
  } catch {
    return { site: "Unknown", domain: url };
  }
}

export function parseCSVFiles(files: File[]): Promise<PasswordEntry[]> {
  return new Promise((resolve) => {
    const allEntries: PasswordEntry[] = [];
    let processed = 0;

    if (files.length === 0) {
      resolve([]);
      return;
    }

    files.forEach((file) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const columns = (results.meta.fields || []).map((c) => c.toLowerCase());
          const originalFields = results.meta.fields || [];

          const urlCol = detectColumn(columns, ["url", "origin", "hostname"]);
          const userCol = detectColumn(columns, ["username", "user", "login"]);
          const passCol = detectColumn(columns, ["password", "pwd"]);

          if (urlCol && userCol && passCol) {
            const urlIdx = columns.indexOf(urlCol);
            const userIdx = columns.indexOf(userCol);
            const passIdx = columns.indexOf(passCol);

            for (const row of results.data as Record<string, string>[]) {
              const rawUrl = row[originalFields[urlIdx]]?.trim();
              const username = row[originalFields[userIdx]]?.trim();
              const password = row[originalFields[passIdx]]?.trim();

              if (rawUrl && username && password) {
                const { site, domain } = extractSiteInfo(rawUrl);
                allEntries.push({ site, domain, username, password });
              }
            }
          }

          processed++;
          if (processed === files.length) {
            // Group and merge
            const grouped = new Map<string, Set<string>>();
            for (const entry of allEntries) {
              const key = `${entry.site}|${entry.domain}|${entry.username}`;
              if (!grouped.has(key)) grouped.set(key, new Set());
              grouped.get(key)!.add(entry.password);
            }

            const final: PasswordEntry[] = [];
            for (const [key, passwords] of grouped) {
              const [site, domain, username] = key.split("|");
              final.push({
                site,
                domain,
                username,
                password: Array.from(passwords).sort().join(" | "),
              });
            }

            final.sort((a, b) => a.site.toLowerCase().localeCompare(b.site.toLowerCase()));
            resolve(final);
          }
        },
      });
    });
  });
}

export function exportToCSV(entries: PasswordEntry[]): string {
  const header = "Site,Domain,Username/Email,Password";
  const rows = entries.map(
    (e) => `"${e.site}","${e.domain}","${e.username}","${e.password}"`
  );
  return [header, ...rows].join("\n");
}

export function exportToText(entries: PasswordEntry[]): string {
  if (!entries.length) return "";

  // Helper to detect email
  const isEmail = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  // Group entries by site + domain
  const grouped = new Map<string, PasswordEntry[]>();

  for (const entry of entries) {
    const key = `${entry.site}|${entry.domain}`;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(entry);
  }

  // Sort sites alphabetically
  const sortedSites = Array.from(grouped.keys()).sort((a, b) => {
    const [siteA] = a.split("|");
    const [siteB] = b.split("|");
    return siteA.toLowerCase().localeCompare(siteB.toLowerCase());
  });

  let content = "";

  sortedSites.forEach((key, siteIndex) => {
    const [site, domain] = key.split("|");
    const accounts = grouped.get(key)!;

    content += `${siteIndex + 1} - ${site} - (${domain}):\r\n\r\n`;

    // Sort accounts by username
    accounts.sort((a, b) =>
      a.username.toLowerCase().localeCompare(b.username.toLowerCase())
    );

    accounts.forEach((account, accIndex) => {
      const labelType = isEmail(account.username)
        ? "Email"
        : "Username";

      content += `${accIndex + 1}) ${labelType}: ${account.username}\r\n`;
      content += `   Pass: ${account.password}\r\n\r\n`;
    });

    content += `\r\n`;
  });

  return content;
}
