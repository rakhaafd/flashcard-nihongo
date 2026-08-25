'use client';

import React, { useState } from 'react';
import { 
  FileUp, 
  Loader2, 
  Save, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  Maximize2,
  X,
  Sparkles
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { FullscreenTableEditor } from '@/components/FullscreenTableEditor';

import { parseKotobaPdf } from '@/lib/pdfParser';
import { saveKotobaBatch } from '@/lib/firestoreService';
import { KotobaItem } from '@/types/kotoba';

interface ImportSectionProps {
  onImportSuccess: (lessonId: number) => void;
}

export const ImportSection: React.FC<ImportSectionProps> = ({ onImportSuccess }) => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [lessonId, setLessonId] = useState<number>(1);
  const [previewItems, setPreviewItems] = useState<Omit<KotobaItem, 'id'>[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [isFullscreenModalOpen, setIsFullscreenModalOpen] = useState(false);
  const [isAiParsed, setIsAiParsed] = useState(false);

  const handleResetFile = () => {
    setPdfFile(null);
    setPreviewItems([]);
    setErrorMsg(null);
    setIsAiParsed(false);
    const inputEl = document.getElementById('minimal-pdf-input') as HTMLInputElement;
    if (inputEl) inputEl.value = '';
  };

  const handleFileUpload = async (file: File) => {
    setPdfFile(file);
    setIsParsing(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const result = await parseKotobaPdf(file);
      setLessonId(result.lessonId || 1);
      setPreviewItems(result.items);
      setIsAiParsed(!!result.isAiParsed);
      setShowPreview(true);
      if (result.items.length === 0) {
        setErrorMsg('Tabel tidak terdeteksi. Anda dapat menambah baris manual.');
      }
    } catch (err: any) {
      setErrorMsg(err instanceof Error ? err.message : 'Gagal memproses file PDF');
    } finally {
      setIsParsing(false);
    }
  };

  const handleSaveToDb = async () => {
    if (previewItems.length === 0) return;
    setIsSaving(true);
    setErrorMsg(null);
    try {
      const finalItems = previewItems.map((item, idx) => ({
        ...item,
        lessonId,
        no: item.no || idx + 1,
      }));

      await saveKotobaBatch(lessonId, finalItems);
      setSuccessMsg(`Tersimpan: ${finalItems.length} kata (Bab ${lessonId})`);
      setIsFullscreenModalOpen(false);

      // Auto reset import section on success
      setPdfFile(null);
      setPreviewItems([]);
      setIsAiParsed(false);
      const inputEl = document.getElementById('minimal-pdf-input') as HTMLInputElement;
      if (inputEl) inputEl.value = '';

      onImportSuccess(lessonId);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err instanceof Error ? err.message : 'Gagal menyimpan data ke database.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between py-3.5 px-4 space-y-0 border-b border-zinc-800/60">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <FileUp className="w-4 h-4 text-[#EEAAC0]" />
            Import PDF
          </CardTitle>

          {isAiParsed && (
            <Badge variant="pink" className="flex items-center gap-1 text-[10px]">
              <Sparkles className="w-3 h-3 text-[#EEAAC0]" /> AI Parsed
            </Badge>
          )}
        </CardHeader>

        <CardContent className="p-4 space-y-3">
          {/* Upload Zone */}
          <div className="relative border border-dashed border-zinc-800 hover:border-[#EEAAC0]/50 bg-zinc-950/40 rounded-lg p-4 text-center flex flex-col items-center justify-center transition-all">
            <input
              type="file"
              accept=".pdf"
              id="minimal-pdf-input"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
            />
            <label htmlFor="minimal-pdf-input" className="cursor-pointer flex flex-col items-center">
              {isParsing ? (
                <Loader2 className="w-5 h-5 animate-spin text-[#EEAAC0] mb-1" />
              ) : (
                <FileUp className="w-5 h-5 text-zinc-400 mb-1" />
              )}
              <span className="text-xs font-medium text-zinc-200">
                {pdfFile ? pdfFile.name : 'Upload PDF Kotoba'}
              </span>
            </label>

            {/* Clear/Delete File [X] Button */}
            {pdfFile && !isParsing && (
              <button
                onClick={handleResetFile}
                className="absolute top-2.5 right-2.5 p-1 rounded-md text-zinc-500 hover:text-rose-400 hover:bg-zinc-900 transition-colors"
                title="Hapus file"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {errorMsg && (
            <div className="p-2.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-2.5 rounded bg-[#EEAAC0]/10 border border-[#EEAAC0]/20 text-[#EEAAC0] text-xs flex items-center justify-between">
              <span>{successMsg}</span>
              <button onClick={() => setSuccessMsg(null)} className="text-zinc-400 hover:text-zinc-100 text-xs">
                &times;
              </button>
            </div>
          )}

          {/* Table Preview */}
          {previewItems.length > 0 && (
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="text-xs font-medium text-zinc-400 flex items-center gap-1 hover:text-zinc-200"
                >
                  {showPreview ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  ({previewItems.length} kata)
                </button>

                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsFullscreenModalOpen(true)}
                    title="Fullscreen Edit"
                  >
                    <Maximize2 className="w-3 h-3" />
                  </Button>

                  <Button variant="pink" size="sm" onClick={handleSaveToDb} disabled={isSaving}>
                    {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                  </Button>
                </div>
              </div>

              {showPreview && (
                <div className="overflow-x-auto max-h-48 rounded border border-zinc-800 bg-zinc-950">
                  <table className="w-full text-left text-xs text-zinc-300">
                    <thead className="sticky top-0 bg-zinc-900 border-b border-zinc-800 text-zinc-400 text-[11px]">
                      <tr>
                        <th className="p-2 w-10 text-center">No</th>
                        <th className="p-2 w-1/3">Hiragana / Kana</th>
                        <th className="p-2 w-1/4">Kanji</th>
                        <th className="p-2">Arti</th>
                        <th className="p-2 w-8 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/50">
                      {previewItems.map((item, idx) => (
                        <tr key={idx} className="hover:bg-zinc-900/50">
                          <td className="p-1.5 text-center text-zinc-500">{item.no}</td>
                          <td className="p-1.5">
                            <Input
                              type="text"
                              value={item.kana}
                              onChange={(e) => {
                                const updated = [...previewItems];
                                updated[idx].kana = e.target.value;
                                setPreviewItems(updated);
                              }}
                              className="h-7 text-xs font-japanese"
                            />
                          </td>
                          <td className="p-1.5">
                            <Input
                              type="text"
                              value={item.kanji || ''}
                              onChange={(e) => {
                                const updated = [...previewItems];
                                updated[idx].kanji = e.target.value;
                                setPreviewItems(updated);
                              }}
                              className="h-7 text-xs font-japanese"
                            />
                          </td>
                          <td className="p-1.5">
                            <Input
                              type="text"
                              value={item.arti}
                              onChange={(e) => {
                                const updated = [...previewItems];
                                updated[idx].arti = e.target.value;
                                setPreviewItems(updated);
                              }}
                              className="h-7 text-xs"
                            />
                          </td>
                          <td className="p-1.5 text-center">
                            <button
                              onClick={() => setPreviewItems(previewItems.filter((_, i) => i !== idx))}
                              className="text-zinc-500 hover:text-rose-400 p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <FullscreenTableEditor
        isOpen={isFullscreenModalOpen}
        onClose={() => setIsFullscreenModalOpen(false)}
        lessonId={lessonId}
        items={previewItems}
        onItemsChange={setPreviewItems}
        onSave={handleSaveToDb}
        isSaving={isSaving}
      />
    </>
  );
};
