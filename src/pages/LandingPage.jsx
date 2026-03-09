import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Layout, Camera, ShoppingCart } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="relative overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[80vh] lg:min-h-[90vh] flex items-center px-4 sm:px-6 lg:px-8 py-12 lg:py-0">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full glass border border-accent/20 text-accent text-xs font-medium mb-6">
              <Sparkles size={14} />
              <span>AI-Powered Interior Design</span>
            </div>
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-serif font-bold leading-[0.9] tracking-tighter mb-8 text-center lg:text-left">
              Elevate Your <br />
              <span className="text-accent italic">Living Space</span>
            </h1>
            <p className="text-lg text-white/60 max-w-md mb-10 leading-relaxed text-center lg:text-left mx-auto lg:mx-0">
              Transform your room with AI-driven recommendations, AR visualization, and curated furniture collections.
            </p>
            <div className="flex flex-wrap justify-center lg:justify-start gap-4">
              <Link
                to="/upload"
                className="px-8 py-4 bg-accent text-black font-semibold rounded-full flex items-center space-x-2 hover:scale-105 transition-transform"
              >
                <span>Start Designing</span>
                <ArrowRight size={18} />
              </Link>
              <Link
                to="/booking"
                className="px-8 py-4 glass border border-white/10 text-white font-semibold rounded-full hover:bg-white/5 transition-colors"
              >
                Browse Catalog
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative aspect-square lg:aspect-auto lg:h-[600px] rounded-3xl overflow-hidden"
          >
            <img
              src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80"
              alt="Modern Interior"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-8 left-8 p-6 glass rounded-2xl max-w-xs"
            >
              <p className="text-sm font-medium mb-1">AI Recommendation</p>
              <p className="text-xs text-white/60">"The minimalist oak table complements the natural lighting in your dining area."</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-serif font-bold mb-4">How it Works</h2>
            <p className="text-white/50">Seamlessly design your dream home in three steps.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Camera,
                title: "Upload Photo",
                desc: "Snap a photo of your room and upload it to our platform."
              },
              {
                icon: Sparkles,
                title: "AI Analysis",
                desc: "Our AI analyzes your space and suggests furniture and layouts."
              },
              {
                icon: ShoppingCart,
                title: "Book & Visualize",
                desc: "Visualize in AR and book your favorite pieces instantly."
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-8 glass rounded-3xl border border-white/5 hover:border-accent/30 transition-colors group"
              >
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center text-accent mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-white/50 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
