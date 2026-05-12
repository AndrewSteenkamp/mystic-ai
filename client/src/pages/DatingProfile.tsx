import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Heart, Loader2 } from "lucide-react";

export default function DatingProfilePage() {
  const [, setLocation] = useLocation();
  const { data: existing } = trpc.dating.myProfile.useQuery();
  
  const [bio, setBio] = useState(existing?.bio || "");
  const [gender, setGender] = useState(existing?.gender || "");
  const [seeking, setSeeking] = useState(existing?.seeking || "");
  const [interests, setInterests] = useState(existing?.interests || "");
  const [birthdate, setBirthdate] = useState(existing?.birthdate || "");
  const [birthTime, setBirthTime] = useState(existing?.birth_time || "");
  const [birthPlace, setBirthPlace] = useState(existing?.birth_place || "");
  const [error, setError] = useState("");

  const createMut = trpc.dating.createProfile.useMutation({
    onSuccess: () => setLocation("/dating"),
    onError: (err) => setError(err.message),
  });

  const handleSubmit = () => {
    if (!birthdate.match(/^\d{4}-\d{2}-\d{2}$/)) { setError("Please enter a valid birthdate"); return; }
    setError("");
    createMut.mutate({ bio, gender, seeking, interests, birthdate, birthTime: birthTime || undefined, birthPlace: birthPlace || undefined });
  };

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold flex items-center gap-2 mb-2">💕 {existing ? "Edit" : "Create"} Dating Profile</h1>
      <p className="text-gray-400 mb-6">Your birth chart will be calculated for cosmic matching.</p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-300">Birthdate *</label>
          <input type="date" value={birthdate} onChange={e => setBirthdate(e.target.value)}
            className="w-full bg-gray-900 border border-purple-800 rounded-lg p-3 text-gray-100 focus:border-purple-500 outline-none" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-300">Birth Time (for accurate Rising sign)</label>
          <input value={birthTime} onChange={e => setBirthTime(e.target.value)} placeholder="e.g. 14:30"
            className="w-full bg-gray-900 border border-purple-800 rounded-lg p-3 text-gray-100 placeholder-gray-600 focus:border-purple-500 outline-none" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-300">Birth Place</label>
          <input value={birthPlace} onChange={e => setBirthPlace(e.target.value)} placeholder="e.g. Cape Town"
            className="w-full bg-gray-900 border border-purple-800 rounded-lg p-3 text-gray-100 placeholder-gray-600 focus:border-purple-500 outline-none" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-300">I am</label>
            <select value={gender} onChange={e => setGender(e.target.value)}
              className="w-full bg-gray-900 border border-purple-800 rounded-lg p-3 text-gray-100 focus:border-purple-500 outline-none">
              <option value="">Prefer not to say</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="non-binary">Non-binary</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-300">Seeking</label>
            <select value={seeking} onChange={e => setSeeking(e.target.value)}
              className="w-full bg-gray-900 border border-purple-800 rounded-lg p-3 text-gray-100 focus:border-purple-500 outline-none">
              <option value="">Anyone</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="any">Any gender</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-300">Bio</label>
          <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell your cosmic matches about yourself..."
            className="w-full bg-gray-900 border border-purple-800 rounded-lg p-3 text-gray-100 placeholder-gray-600 focus:border-purple-500 outline-none h-24 resize-none" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-300">Interests (comma-separated)</label>
          <input value={interests} onChange={e => setInterests(e.target.value)} placeholder="e.g. hiking, music, stargazing, cooking"
            className="w-full bg-gray-900 border border-purple-800 rounded-lg p-3 text-gray-100 placeholder-gray-600 focus:border-purple-500 outline-none" />
        </div>

        {error && <div className="text-red-400 text-sm bg-red-900/20 p-3 rounded-lg">{error}</div>}

        <button onClick={handleSubmit} disabled={createMut.isPending}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-medium hover:from-purple-500 hover:to-pink-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
          {createMut.isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Calculating your chart...</> : <><Heart className="w-4 h-4" /> {existing ? "Update" : "Create"} Profile</>}
        </button>
      </div>
    </div>
  );
}
