import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Sparkles, Loader2, RefreshCw, Upload } from "lucide-react";
import PostReadingCTA from "@/components/PostReadingCTA";

export default function FacePage() {
  const [image, setImage] = useState<string | null>(null);
  const [reading, setReading] = useState<any>(null);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const mutate = trpc.divination.faceRead.useMutation({
    onSuccess: (data) => {
      if ((data as any).error) setError((data as any).message);
      else { setReading(data); setError(""); }
    }, onError: (err) => setError(err.message),
  });
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader(); reader.onload = () => setImage(reader.result as string); reader.readAsDataURL(file);
  };
  const handleRead = () => {
    if (!image) { setError("Please upload a photo"); return; }
    setError(""); mutate.mutate({ imageBase64: image.split(",")[1] || image });
  };
  if (reading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6"><h1 className="text-2xl font-bold">👤 Face Reading</h1><button onClick={() => setReading(null)} className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"><RefreshCw className="w-3 h-3" /> New Reading</button></div>
        <div className="glass-card rounded-xl p-6"><h2 className="text-lg font-bold mb-3">✨ Your Reading</h2><div className="text-gray-300 leading-relaxed whitespace-pre-wrap text-sm">{reading.interpretation}</div></div>
      </div>
    );
  }
  return (
    <div className="max-w-lg mx-auto"><h1 className="text-2xl font-bold mb-2">👤 Face Reading (Mian Xiang)</h1><p className="text-gray-400 mb-6">Upload a clear front-facing photo for an ancient Chinese face reading.</p>
      <div className="space-y-4 mb-6">
        {image ? (<div className="relative"><img src={image} alt="Face" className="w-full rounded-xl border border-purple-800" /><button onClick={() => setImage(null)} className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-6 h-6 text-xs">✕</button></div>
        ) : (<div onClick={() => fileRef.current?.click()} className="border-2 border-dashed border-purple-800 rounded-xl p-12 text-center cursor-pointer hover:border-purple-600"><Upload className="w-8 h-8 text-purple-500 mx-auto mb-2" /><p className="text-gray-400 text-sm">Click to upload face photo</p></div>)}
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
        {error && <div className="text-red-400 text-sm bg-red-900/20 p-3 rounded-lg">{error}</div>}
<div className="text-gray-300 leading-relaxed whitespace-pre-wrap text-sm">{reading.interpretation}</div>
        </div>
        <PostReadingCTA />
      </div>
  );
}
