import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Sparkles, Loader2, RefreshCw, Upload, Camera } from "lucide-react";
import PostReadingCTA from "@/components/PostReadingCTA";

export default function PalmPage() {
  const [image, setImage] = useState<string | null>(null);
  const [hand, setHand] = useState<"left"|"right"|"auto">("auto");
  const [reading, setReading] = useState<any>(null);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const mutate = trpc.divination.palmRead.useMutation({
    onSuccess: (data) => {
      if ((data as any).error) setError((data as any).message);
      else { setReading(data); setError(""); }
    }, onError: (err) => setError(err.message),
  });

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleRead = () => {
    if (!image) { setError("Please upload a photo of your palm"); return; }
    const base64 = image.split(",")[1] || image;
    setError(""); mutate.mutate({ imageBase64: base64, hand });
  };

  if (reading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6"><h1 className="text-2xl font-bold">✋ Palm Reading</h1><button onClick={() => setReading(null)} className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"><RefreshCw className="w-3 h-3" /> New Reading</button></div>
        <div className="glass-card rounded-xl p-4 mb-4"><div className="text-xs text-gray-500 mb-1">Hand: {reading.hand}</div><div className="text-gray-400 text-xs italic">{reading.features?.substring(0,300)}...</div></div>
        <div className="glass-card rounded-xl p-6"><h2 className="text-lg font-bold mb-3">✨ Your Reading</h2><div className="text-gray-300 leading-relaxed whitespace-pre-wrap text-sm">{reading.interpretation}</div></div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto"><h1 className="text-2xl font-bold mb-2">✋ Palm Reading</h1><p className="text-gray-400 mb-6">Upload a clear photo of your palm for an AI reading.</p>
      <div className="space-y-4 mb-6">
        {image ? (
          <div className="relative"><img src={image} alt="Palm" className="w-full rounded-xl border border-purple-800" /><button onClick={() => setImage(null)} className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-6 h-6 text-xs">✕</button></div>
        ) : (
          <div onClick={() => fileRef.current?.click()} className="border-2 border-dashed border-purple-800 rounded-xl p-12 text-center cursor-pointer hover:border-purple-600 transition-colors"><Upload className="w-8 h-8 text-purple-500 mx-auto mb-2" /><p className="text-gray-400 text-sm">Click to upload palm photo</p></div>
        )}
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
        <div><label className="block text-sm font-medium mb-2 text-gray-300">Which Hand?</label>
          <div className="grid grid-cols-3 gap-2">{["auto","left","right"].map(h => (
            <button key={h} onClick={() => setHand(h as any)} className={`p-2 rounded-lg border text-sm capitalize ${hand===h?"border-purple-500 bg-purple-900/30":"border-gray-800 bg-gray-900"}`}>{h}</button>
          ))}</div>
        </div>
        {error && <div className="text-red-400 text-sm bg-red-900/20 p-3 rounded-lg">{error}</div>}
        <button onClick={handleRead} disabled={mutate.isPending} className="w-full bg-gradient-to-r from-rose-600 to-red-600 text-white py-3 rounded-lg font-medium disabled:opacity-50 flex items-center justify-center gap-2">{mutate.isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing palm...</> : <><Sparkles className="w-4 h-4" /> Read My Palm</>}</button>
      </div>
    </div>
  );
}
