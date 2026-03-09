import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Upload, Camera, X, ArrowRight, Loader2 } from 'lucide-react';

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [style, setStyle] = useState('Modern');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);

    // Simulate a small delay for "processing"
    setTimeout(() => {
      setIsUploading(false);
      navigate('/recommendations', { 
        state: { 
          imageBase64: preview,
          style 
        } 
      });
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12 px-4"
      >
        <h1 className="text-3xl sm:text-5xl font-serif font-bold mb-4">Upload Your Space</h1>
        <p className="text-white/50 text-sm sm:text-base">Let our AI analyze your room and provide tailored design suggestions.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div 
            onClick={() => !preview && fileInputRef.current?.click()}
            className={cn(
              "relative aspect-video rounded-3xl border-2 border-dashed flex flex-col items-center justify-center transition-all overflow-hidden",
              preview ? "border-transparent" : "border-white/10 hover:border-accent/50 cursor-pointer bg-white/[0.02]"
            )}
          >
            {preview ? (
              <>
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                <button 
                  onClick={(e) => { e.stopPropagation(); setPreview(null); setFile(null); }}
                  className="absolute top-4 right-4 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                >
                  <X size={20} />
                </button>
              </>
            ) : (
              <div className="text-center p-8">
                <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center text-accent mx-auto mb-4">
                  <Upload size={32} />
                </div>
                <p className="text-lg font-medium mb-1">Click to upload or drag & drop</p>
                <p className="text-sm text-white/40">PNG, JPG, WEBP up to 10MB</p>
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept="image/*" 
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass p-6 rounded-3xl border border-white/5">
            <h3 className="text-lg font-bold mb-4">Design Style</h3>
            <div className="grid grid-cols-2 gap-3">
              {['Modern', 'Minimal', 'Luxury', 'Traditional'].map((s) => (
                <button
                  key={s}
                  onClick={() => setStyle(s)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-medium transition-all",
                    style === s 
                      ? "bg-accent text-black" 
                      : "bg-white/5 text-white/60 hover:bg-white/10"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <button
            disabled={!file || isUploading}
            onClick={handleUpload}
            className="w-full py-4 bg-accent disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold rounded-2xl flex items-center justify-center space-x-2 hover:scale-[1.02] transition-transform"
          >
            {isUploading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <>
                <span>Analyze Room</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function cn(...inputs) {
  return inputs.filter(Boolean).join(' ');
}
