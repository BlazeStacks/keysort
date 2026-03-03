import { useState, useCallback } from "react";
import { Search, Download, Shield, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import FileDropZone from "@/components/FileDropZone";
import PasswordTable from "@/components/PasswordTable";
import { parseCSVFiles, exportToCSV, exportToText, type PasswordEntry } from "@/lib/csv-parser";

const Index = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [entries, setEntries] = useState<PasswordEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCompiling, setIsCompiling] = useState(false);

  const handleFilesAdd = useCallback((newFiles: File[]) => {
    setFiles((prev) => {
      const names = new Set(prev.map((f) => f.name));
      const unique = newFiles.filter((f) => !names.has(f.name));
      return [...prev, ...unique];
    });
  }, []);

  const handleFileRemove = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleCompile = async () => {
    if (files.length === 0) {
      toast.error("No CSV files added");
      return;
    }
    setIsCompiling(true);
    try {
      const results = await parseCSVFiles(files);
      setEntries(results);
      toast.success(`Compiled ${results.length} entries from ${files.length} file(s)`);
    } catch {
      toast.error("Failed to parse files");
    }
    setIsCompiling(false);
  };

  const handleExport = (format: "csv" | "txt") => {
    if (entries.length === 0) {
      toast.error("No data to export");
      return;
    }
    const content = format === "csv" ? exportToCSV(entries) : exportToText(entries);
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `compiled_passwords.${format}`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported as .${format}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Ambient glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-4 py-10 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-3"
        >
          <div className="inline-flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 glow-sm">
              <Shield className="h-7 w-7 text-primary" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight">
              Key<span className="text-gradient">Sort</span>
            </h1>
          </div>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Import, compile, and organize your exported passwords from any browser
          </p>
        </motion.div>

        {/* Upload */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <FileDropZone files={files} onFilesAdd={handleFilesAdd} onFileRemove={handleFileRemove} />
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap gap-3"
        >
          <button
            onClick={handleCompile}
            disabled={isCompiling || files.length === 0}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed glow-sm"
          >
            {isCompiling ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
            Compile & Preview
          </button>

          {entries.length > 0 && (
            <>
              <button
                onClick={() => handleExport("csv")}
                className="flex items-center gap-2 bg-secondary text-secondary-foreground px-4 py-2.5 rounded-lg text-sm hover:bg-surface-hover transition-colors"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </button>
              <button
                onClick={() => handleExport("txt")}
                className="flex items-center gap-2 bg-secondary text-secondary-foreground px-4 py-2.5 rounded-lg text-sm hover:bg-surface-hover transition-colors"
              >
                <Download className="h-4 w-4" />
                Export TXT
              </button>
            </>
          )}
        </motion.div>

        {/* Search */}
        {entries.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative"
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search site, domain, username..."
              className="w-full bg-secondary border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-shadow"
            />
          </motion.div>
        )}

        {/* Table */}
        <PasswordTable entries={entries} searchQuery={searchQuery} />

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground pt-6">
          All data stays on your PC — nothing is uploaded
        </div>
      </div>
    </div>
  );
};

export default Index;
