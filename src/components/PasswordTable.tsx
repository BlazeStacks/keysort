import { useState } from "react";
import { Copy, Eye, EyeOff, Globe, User, Lock, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { PasswordEntry } from "@/lib/csv-parser";

interface PasswordTableProps {
  entries: PasswordEntry[];
  searchQuery: string;
}

const PasswordTable = ({ entries, searchQuery }: PasswordTableProps) => {
  const [passwordsVisible, setPasswordsVisible] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<string | null>(null);

  const filtered = entries.filter((e) => {
    const q = searchQuery.toLowerCase();
    return (
      e.site.toLowerCase().includes(q) ||
      e.domain.toLowerCase().includes(q) ||
      e.username.toLowerCase().includes(q) ||
      (passwordsVisible && e.password.toLowerCase().includes(q))
    );
  });

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(id);
    setTimeout(() => setCopiedIdx(null), 1500);
  };

  if (entries.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filtered.length} of {entries.length} entries
        </p>
        <button
          onClick={() => setPasswordsVisible(!passwordsVisible)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-md hover:bg-secondary"
        >
          {passwordsVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          {passwordsVisible ? "Hide" : "Show"} passwords
        </button>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[1fr_1.2fr_1.5fr_1.5fr] gap-px bg-secondary/80 px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          <div className="flex items-center gap-2"><Globe className="h-3 w-3" /> Site</div>
          <div>Domain</div>
          <div className="flex items-center gap-2"><User className="h-3 w-3" /> Username</div>
          <div className="flex items-center gap-2"><Lock className="h-3 w-3" /> Password</div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-border max-h-[500px] overflow-y-auto">
          <AnimatePresence initial={false}>
            {filtered.map((entry, i) => (
              <motion.div
                key={`${entry.domain}-${entry.username}-${i}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="grid grid-cols-[1fr_1.2fr_1.5fr_1.5fr] gap-px px-4 py-3 text-sm hover:bg-secondary/40 transition-colors group"
              >
                <div className="font-medium truncate">{entry.site}</div>
                <div className="text-muted-foreground font-mono text-xs truncate self-center">{entry.domain}</div>
                <div className="flex items-center gap-2 truncate">
                  <span className="truncate">{entry.username}</span>
                  <button
                    onClick={() => copyToClipboard(entry.username, `user-${i}`)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 text-muted-foreground hover:text-primary"
                  >
                    {copiedIdx === `user-${i}` ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
                <div className="flex items-center gap-2 truncate">
                  <span className="font-mono text-xs truncate">
                    {passwordsVisible ? entry.password : "••••••••••"}
                  </span>
                  <button
                    onClick={() => copyToClipboard(entry.password, `pass-${i}`)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 text-muted-foreground hover:text-primary"
                  >
                    {copiedIdx === `pass-${i}` ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default PasswordTable;
