import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Sparkles, ArrowLeft, ShoppingCart, CheckCircle2, Loader2, Camera } from 'lucide-react';
import { getInteriorRecommendations } from '../services/geminiService';
import ARViewer from '../components/ARViewer';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function RecommendationsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { imagePath, imageBase64, style } = location.state || {};
  
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAR, setShowAR] = useState(false);
  const [arFurniture, setArFurniture] = useState(null);

  useEffect(() => {
    if (!imageBase64) {
      navigate('/upload');
      return;
    }

    async function fetchRecommendations() {
      try {
        const data = await getInteriorRecommendations(imageBase64, style);
        setRecommendations(data);

        // Save to history if user is logged in
        if (auth.currentUser) {
          try {
            await addDoc(collection(db, 'history'), {
              uid: auth.currentUser.uid,
              style,
              recommendations: data,
              createdAt: serverTimestamp(),
              imageBase64: imageBase64.substring(0, 100000)
            });
          } catch (err) {
            handleFirestoreError(err, OperationType.CREATE, 'history');
          }
        }
      } catch (error) {
        console.error('Failed to get recommendations:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchRecommendations();
  }, [imageBase64, style, navigate]);

  const handleVisualize = (rec) => {
    setArFurniture({
      name: rec.furnitureName,
      type: rec.furnitureName.toLowerCase().includes('table') ? 'table' : 
            rec.furnitureName.toLowerCase().includes('chair') ? 'chair' : 'sofa',
      color: rec.colorTheme.split(' ')[0].toLowerCase() || '#c4a484'
    });
    setShowAR(true);
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center">
        <Loader2 size={48} className="text-accent animate-spin mb-4" />
        <p className="text-xl font-serif italic text-white/60">AI is analyzing your space...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {showAR && <ARViewer initialFurniture={arFurniture} onClose={() => setShowAR(false)} />}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
        <button 
          onClick={() => navigate('/upload')}
          className="flex items-center space-x-2 text-white/60 hover:text-white transition-colors w-fit"
        >
          <ArrowLeft size={20} />
          <span>Back to Upload</span>
        </button>
        <div className="text-left sm:text-right">
          <h1 className="text-2xl sm:text-3xl font-serif font-bold">Design Recommendations</h1>
          <p className="text-accent text-sm">{style} Style</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-12">
        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl overflow-hidden border border-white/10 relative group"
          >
            <img src={imageBase64} alt="Original Room" className="w-full h-auto" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button 
                onClick={() => setShowAR(true)}
                className="px-6 py-3 bg-accent text-black font-bold rounded-full flex items-center space-x-2 hover:scale-105 transition-transform"
              >
                <Camera size={20} />
                <span>Visualize Room</span>
              </button>
            </div>
            <div className="p-4 glass text-center text-xs text-white/40">Original Room Photo</div>
          </motion.div>

          <div className="glass p-8 rounded-3xl border border-white/5">
            <h3 className="text-xl font-bold mb-6 flex items-center space-x-2">
              <Sparkles size={20} className="text-accent" />
              <span>AI Analysis Summary</span>
            </h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <CheckCircle2 size={18} className="text-accent mt-1 shrink-0" />
                <p className="text-sm text-white/70">Detected ample natural light from the left side, suggesting light-colored furniture to enhance brightness.</p>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle2 size={18} className="text-accent mt-1 shrink-0" />
                <p className="text-sm text-white/70">The room layout favors a modular seating arrangement to maximize floor space.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {recommendations.map((rec, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass p-6 rounded-3xl border border-white/5 hover:border-accent/30 transition-all group"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-xl font-bold text-accent">{rec.furnitureName}</h4>
                  <p className="text-xs text-white/40 uppercase tracking-widest mt-1">{rec.colorTheme}</p>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleVisualize(rec)}
                    className="p-3 bg-white/5 rounded-xl hover:bg-accent hover:text-black transition-all"
                    title="Visualize in AR"
                  >
                    <Camera size={18} />
                  </button>
                  <button 
                    onClick={() => navigate('/booking')}
                    className="p-3 bg-white/5 rounded-xl hover:bg-accent hover:text-black transition-all"
                  >
                    <ShoppingCart size={18} />
                  </button>
                </div>
              </div>
              <p className="text-sm text-white/70 mb-4 leading-relaxed">{rec.description}</p>
              <div className="pt-4 border-t border-white/5">
                <p className="text-xs font-medium text-white/40 mb-1">Placement Suggestion:</p>
                <p className="text-sm italic text-white/60">{rec.placementSuggestion}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
