import { useCallback, useState } from "react";
import { Upload, FileText, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FileDropZoneProps {
  files: File[];
  onFilesAdd: (files: File[]) => void;
  onFileRemove: (index: number) => void;
}

const FileDropZone = ({ files, onFilesAdd, onFileRemove }: FileDropZoneProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const droppedFiles = Array.from(e.dataTransfer.files).filter((f) =>
        f.name.endsWith(".csv")
      );
      if (droppedFiles.length) onFilesAdd(droppedFiles);
    },
    [onFilesAdd]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onFilesAdd(Array.from(e.target.files));
      e.target.value = "";
    }
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer ${
          isDragging
            ? "border-primary bg-primary/5 glow-border"
            : "border-border hover:border-muted-foreground"
        }`}
        onClick={() => document.getElementById("csv-input")?.click()}
      >
        <input
          id="csv-input"
          type="file"
          accept=".csv"
          multiple
          className="hidden"
          onChange={handleFileInput}
        />
        <Upload className={`mx-auto mb-3 h-8 w-8 transition-colors ${isDragging ? "text-primary" : "text-muted-foreground"}`} />
        <p className="text-sm text-muted-foreground">
          <span className="text-primary font-medium">Click to upload</span> or drag & drop CSV files
        </p>
        <p className="text-xs text-muted-foreground mt-1">Supports Chrome, Firefox, Edge password exports</p>
      </div>

      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            {files.map((file, i) => (
              <motion.div
                key={file.name + i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-3 bg-secondary rounded-md px-3 py-2 group"
              >
                <FileText className="h-4 w-4 text-primary shrink-0" />
                <span className="text-sm font-mono truncate flex-1">{file.name}</span>
                <span className="text-xs text-muted-foreground">
                  {(file.size / 1024).toFixed(1)}KB
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); onFileRemove(i); }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FileDropZone;
