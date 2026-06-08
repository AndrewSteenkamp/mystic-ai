import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Camera, Upload, Loader2, Sparkles, CheckCircle2, AlertTriangle, ChefHat, ArrowRight, Search } from "lucide-react";

export default function FoodIdentifier() {
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [grams, setGrams] = useState<number>(150);
  const [identification, setIdentification] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const identifyMutation = trpc.lifestyle.identifyFood.useMutation();
  const calculateMutation = trpc.lifestyle.calculateKJ.useMutation();

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file (JPG, PNG, etc.)");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setPreviewUrl(dataUrl);
      const base64 = dataUrl.split(",")[1];
      setImageBase64(base64);
      setIdentification(null);
    };
    reader.readAsDataURL(file);
  };

  const identifyFood = async () => {
    if (!imageBase64) return;
    try {
      const result = await identifyMutation.mutateAsync({ imageBase64 });
      setIdentification(result);
    } catch (e: any) {
      alert("Identification failed: " + e.message);
    }
  };

  const calculateForIdentified = async (foodName: string, weight: number) => {
    try {
      const result = await calculateMutation.mutateAsync({ foodName, grams: weight });
      return result;
    } catch (e: any) {
      return { error: e.message };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-2xl">
            📸
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-100">Food Identifier</h2>
            <p className="text-xs text-gray-400">Snap a photo → AI identifies the food → get its kilojoules</p>
          </div>
        </div>
        <div className="text-xs text-gray-500 bg-purple-900/20 rounded-lg p-2 border border-purple-800/30">
          <Sparkles className="w-3 h-3 inline mr-1" />
          Powered by Gemini Vision. Works best with clear, well-lit photos of single foods on a plain background.
        </div>
      </div>

      {/* Image Capture / Upload */}
      <div className="glass-card rounded-2xl p-5">
        <h3 className="text-sm font-medium text-gray-200 mb-3">Step 1: Take or upload a photo</h3>

        {!previewUrl ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => cameraInputRef.current?.click()}
                className="flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-purple-600/30 to-pink-600/30 hover:from-purple-600/50 hover:to-pink-600/50 border border-purple-500/40 rounded-xl p-6 transition-all"
              >
                <Camera className="w-7 h-7 text-purple-300" />
                <span className="text-sm font-medium text-purple-200">Take Photo</span>
                <span className="text-[10px] text-purple-300/60">Use phone camera</span>
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-blue-600/30 to-indigo-600/30 hover:from-blue-600/50 hover:to-indigo-600/50 border border-blue-500/40 rounded-xl p-6 transition-all"
              >
                <Upload className="w-7 h-7 text-blue-300" />
                <span className="text-sm font-medium text-blue-200">Upload File</span>
                <span className="text-[10px] text-blue-300/60">JPG or PNG</span>
              </button>
            </div>
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
          </div>
        ) : (
          <div className="space-y-3">
            <div className="relative rounded-xl overflow-hidden border border-purple-500/30">
              <img src={previewUrl} alt="Food preview" className="w-full max-h-96 object-contain bg-gray-900" />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { setPreviewUrl(null); setImageBase64(null); setIdentification(null); }}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm py-2 rounded-xl transition-colors"
              >
                Choose Different Photo
              </button>
              <button
                onClick={identifyFood}
                disabled={identifyMutation.isPending}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium py-2 rounded-xl hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {identifyMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</>
                ) : (
                  <><Sparkles className="w-4 h-4" /> Identify Food</>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Identification Result */}
      {identification && (
        <div className="space-y-4">
          {/* Primary identification */}
          <div className={`glass-card rounded-2xl p-5 border-2 ${
            identification.confidence === "high" ? "border-emerald-500/50" :
            identification.confidence === "medium" ? "border-amber-500/50" : "border-rose-500/50"
          }`}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">AI Identified</div>
                <h3 className="text-lg font-bold text-gray-100">{identification.primary.name}</h3>
                {identification.primary.description && (
                  <p className="text-xs text-gray-400 mt-1 italic">{identification.primary.description}</p>
                )}
              </div>
              <div className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full ${
                identification.confidence === "high" ? "bg-emerald-900/30 text-emerald-300" :
                identification.confidence === "medium" ? "bg-amber-900/30 text-amber-300" : "bg-rose-900/30 text-rose-300"
              }`}>
                {identification.confidence}
              </div>
            </div>

            {identification.primary.matchedFoodId && (
              <div className="bg-emerald-900/20 border border-emerald-700/40 rounded-lg p-2 mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className="text-xs text-emerald-200">
                  Matched in our database: <span className="font-medium">{identification.primary.matchedFoodName}</span>
                </span>
              </div>
            )}

            <div className="text-xs text-gray-400">
              Estimated serving: <span className="text-gray-200 font-medium">{identification.primary.estimatedServingLabel}</span>
            </div>

            {/* Alternates */}
            {identification.alternates?.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-700/50">
                <div className="text-[10px] uppercase tracking-widest text-gray-500 mb-2">Other possibilities</div>
                <div className="space-y-1">
                  {identification.alternates.map((alt: any, i: number) => (
                    <div key={i} className="text-xs text-gray-400 flex items-center gap-2">
                      <span className="text-gray-500">•</span>
                      <span>{alt.name}</span>
                      {alt.matchedFoodId && (
                        <span className="text-[10px] text-emerald-400 bg-emerald-900/20 px-1.5 py-0.5 rounded">
                          in DB
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {identification.source !== "none" && (
              <div className="text-[10px] text-gray-500 mt-2">
                via {identification.source === "gemini" ? "Gemini Vision" : "DeepSeek Vision"}
              </div>
            )}
          </div>

          {/* Use identified food in kJ calc */}
          {identification.primary.matchedFoodId && (
            <QuickCalc
              foodName={identification.primary.matchedFoodName}
              foodId={identification.primary.matchedFoodId}
              suggestedGrams={identification.primary.estimatedServingG}
              calculateMutation={calculateMutation}
            />
          )}

          {!identification.primary.matchedFoodId && identification.primary.estimatedServingG > 0 && (
            <UnknownFoodCalc
              foodName={identification.primary.name}
              suggestedGrams={identification.primary.estimatedServingG}
              calculateMutation={calculateMutation}
            />
          )}
        </div>
      )}
    </div>
  );
}

function QuickCalc({ foodName, foodId, suggestedGrams, calculateMutation }: any) {
  const [grams, setGrams] = useState(suggestedGrams || 150);
  const [result, setResult] = useState<any>(null);

  const calc = async () => {
    const r = await calculateMutation.mutateAsync({ foodName, grams });
    setResult(r);
  };

  return (
    <div className="glass-card rounded-2xl p-5">
      <h3 className="text-sm font-medium text-gray-200 mb-3">Step 2: Calculate kilojoules</h3>
      <div className="flex items-center gap-2 mb-3">
        <input
          type="number"
          value={grams}
          onChange={(e) => setGrams(parseInt(e.target.value) || 0)}
          min="1"
          max="5000"
          className="flex-1 bg-gray-900/50 border border-purple-800/50 rounded-xl px-3 py-2 text-sm text-gray-200"
        />
        <span className="text-sm text-gray-400">grams</span>
        <button
          onClick={calc}
          disabled={calculateMutation.isPending || grams <= 0}
          className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-medium px-4 py-2 rounded-xl hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 transition-all"
        >
          {calculateMutation.isPending ? "..." : "Calculate"}
        </button>
      </div>

      {result && (
        <div className="bg-emerald-900/20 border border-emerald-700/40 rounded-xl p-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-[10px] uppercase text-emerald-300/70">Total</div>
              <div className="text-xl font-bold text-emerald-200">{result.totals.kj} kJ</div>
              <div className="text-xs text-emerald-300/70">{result.totals.kcal} kcal</div>
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between"><span className="text-gray-400">Protein</span><span className="text-gray-200">{result.totals.protein}g</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Carbs</span><span className="text-gray-200">{result.totals.carbs}g</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Fat</span><span className="text-gray-200">{result.totals.fat}g</span></div>
              {result.totals.fiber != null && (
                <div className="flex justify-between"><span className="text-gray-400">Fiber</span><span className="text-gray-200">{result.totals.fiber}g</span></div>
              )}
            </div>
          </div>
          <div className="text-[10px] text-emerald-400/60 mt-2 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Sourced from database ({result.confidence} confidence)
          </div>
        </div>
      )}
    </div>
  );
}

function UnknownFoodCalc({ foodName, suggestedGrams, calculateMutation }: any) {
  const [grams, setGrams] = useState(suggestedGrams || 100);
  const [result, setResult] = useState<any>(null);

  const calc = async () => {
    const r = await calculateMutation.mutateAsync({ foodName, grams });
    setResult(r);
  };

  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="bg-amber-900/20 border border-amber-700/40 rounded-lg p-2 mb-3 flex items-start gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-amber-200">
          Not in our database yet. We'll ask the AI for an estimate. This will be logged for review so we can add it permanently.
        </div>
      </div>

      <h3 className="text-sm font-medium text-gray-200 mb-3">Step 2: Calculate (AI estimate)</h3>
      <div className="flex items-center gap-2 mb-3">
        <input
          type="number"
          value={grams}
          onChange={(e) => setGrams(parseInt(e.target.value) || 0)}
          min="1"
          max="5000"
          className="flex-1 bg-gray-900/50 border border-amber-800/50 rounded-xl px-3 py-2 text-sm text-gray-200"
        />
        <span className="text-sm text-gray-400">grams</span>
        <button
          onClick={calc}
          disabled={calculateMutation.isPending || grams <= 0}
          className="bg-gradient-to-r from-amber-600 to-orange-600 text-white text-sm font-medium px-4 py-2 rounded-xl hover:from-amber-500 hover:to-orange-500 disabled:opacity-50 transition-all"
        >
          {calculateMutation.isPending ? "..." : "Estimate"}
        </button>
      </div>

      {result && (
        <div className="bg-amber-900/20 border border-amber-700/40 rounded-xl p-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-[10px] uppercase text-amber-300/70">Total</div>
              <div className="text-xl font-bold text-amber-200">
                {result.totals.kj > 0 ? `${result.totals.kj} kJ` : "—"}
              </div>
              <div className="text-xs text-amber-300/70">
                {result.totals.kcal > 0 ? `${result.totals.kcal} kcal` : ""}
              </div>
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between"><span className="text-gray-400">Protein</span><span className="text-gray-200">{result.totals.protein}g</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Carbs</span><span className="text-gray-200">{result.totals.carbs}g</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Fat</span><span className="text-gray-200">{result.totals.fat}g</span></div>
            </div>
          </div>
          <div className="text-[10px] text-amber-400/70 mt-2">
            ⚠️ AI estimate ({result.confidence} confidence). {result.warning}
          </div>
        </div>
      )}
    </div>
  );
}
