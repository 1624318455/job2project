'use client';

import { useState, useRef } from 'react';

interface InputAreaProps {
  onSubmit: (text: string, imageBase64?: string) => void;
  disabled?: boolean;
}

export default function InputArea({ onSubmit, disabled }: InputAreaProps) {
  const [text, setText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [inputMode, setInputMode] = useState<'text' | 'image' | 'url'>('text');
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    let finalText = text;
    
    if (inputMode === 'url' && urlInput.trim()) {
      finalText = `[URL]${urlInput.trim()}`;
    } else if (inputMode === 'image' && selectedImage) {
      onSubmit(text, selectedImage);
      setText('');
      setSelectedImage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }
    
    if (!finalText.trim()) return;

    onSubmit(finalText, selectedImage || undefined);
    setText('');
    setSelectedImage(null);
    setUrlInput('');

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey && inputMode !== 'url') {
      event.preventDefault();
      handleSubmit();
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      {/* 输入模式切换 */}
      <div className="flex gap-2 text-xs">
        <button
          onClick={() => setInputMode('text')}
          className={`px-3 py-1 rounded-full transition-colors ${
            inputMode === 'text' ? 'bg-cta text-primary' : 'bg-secondary text-muted'
          }`}
        >
          文本
        </button>
        <button
          onClick={() => setInputMode('image')}
          className={`px-3 py-1 rounded-full transition-colors ${
            inputMode === 'image' ? 'bg-cta text-primary' : 'bg-secondary text-muted'
          }`}
        >
          图片
        </button>
        <button
          onClick={() => setInputMode('url')}
          className={`px-3 py-1 rounded-full transition-colors ${
            inputMode === 'url' ? 'bg-cta text-primary' : 'bg-secondary text-muted'
          }`}
        >
          URL
        </button>
      </div>

      {/* URL输入模式 */}
      {inputMode === 'url' && (
        <input
          type="url"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          placeholder="粘贴招聘页面的URL (BOSS直聘、智联招聘等)..."
          disabled={disabled}
          className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder-muted focus:outline-none focus:border-cta transition-colors disabled:opacity-50"
        />
      )}

      {/* 图片预览 */}
      {inputMode === 'image' && selectedImage && (
        <div className="relative inline-block">
          <img
            src={selectedImage}
            alt="Selected image"
            className="max-h-32 rounded-lg border border-border"
          />
          <button
            onClick={removeImage}
            className="absolute -top-2 -right-2 w-6 h-6 bg-error text-white rounded-full flex items-center justify-center hover:bg-error/80 transition-colors cursor-pointer"
            aria-label="Remove image"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* 文本输入模式 */}
      {inputMode === 'text' && (
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="粘贴岗位描述或上传招聘截图..."
          disabled={disabled}
          className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder-muted resize-none focus:outline-none focus:border-cta transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          rows={3}
        />
      )}

      {/* 操作按钮 */}
      <div className="flex items-end gap-3">
        <div className="flex-1" />
        
        <div className="flex items-center gap-2">
          {/* 图片上传按钮 */}
          {inputMode === 'image' && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleImageSelect}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className={`p-3 bg-secondary border border-border rounded-lg hover:bg-secondary/80 transition-colors cursor-pointer ${
                  disabled ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <svg className="w-5 h-5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </label>
            </>
          )}

          {/* 发送按钮 */}
          <button
            onClick={handleSubmit}
            disabled={disabled || (
              inputMode === 'text' ? !text.trim() : 
              inputMode === 'image' ? !selectedImage :
              !urlInput.trim()
            )}
            className="p-3 bg-cta text-primary rounded-lg hover:bg-cta/80 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
