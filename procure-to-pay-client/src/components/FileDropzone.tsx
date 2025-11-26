import { useCallback, useRef, useState } from 'react';
import { Button } from './ui/Button';

interface Props {
  onFileSelect?: (file: File | null) => void;
  label?: string;
}

export const FileDropzone = ({ onFileSelect, label = 'Proforma document' }: Props) => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      const selected = files && files[0] ? files[0] : null;
      setFile(selected);
      onFileSelect?.(selected);
    },
    [onFileSelect],
  );

  const openFileDialog = () => {
    // Must be called directly from a user click event
    inputRef.current?.click();
  };

  return (
    <div>
      <p className="text-sm font-semibold text-slate-600">{label}</p>

      <div
        onClick={e => {
          e.preventDefault();
          openFileDialog();
        }}
        onDragOver={evt => {
          evt.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={evt => {
          evt.preventDefault();
          setDragActive(false);
        }}
        onDrop={evt => {
          evt.preventDefault();
          setDragActive(false);
          handleFiles(evt.dataTransfer.files);
        }}
        className={`mt-2 flex flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-6 text-center transition
        ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-white hover:border-blue-400 hover:bg-slate-50'}
        cursor-pointer`}
      >
        <p className="text-sm font-semibold text-slate-700">Drop file here or browse</p>
        <p className="text-xs text-slate-500">PDF, PNG, JPG up to 10 MB</p>

        <div className="mt-3">
          <Button
            variant="secondary"
            type="button"
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();
              openFileDialog();
            }}
          >
            Choose File
          </Button>
        </div>
      </div>

      {/* Hidden input that actually opens the system file picker */}
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept=".pdf,.png,.jpg,.jpeg"
        onChange={evt => handleFiles(evt.target.files)}
      />

      {file && (
        <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-800">{file.name}</p>
              <p className="text-xs text-slate-500">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={() => {
                // clear both UI and parent state
                setFile(null);
                onFileSelect?.(null);
                // also clear the input value so choosing the same file again still triggers onChange
                if (inputRef.current) {
                  inputRef.current.value = '';
                }
              }}
            >
              Remove
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
