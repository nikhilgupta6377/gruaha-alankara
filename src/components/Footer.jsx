import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#0a0a0a] border-t border-white/5 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="inline-block mb-6">
              <span className="text-2xl font-serif font-bold tracking-tighter text-accent">GRUHA ALANKARA</span>
            </Link>
            <p className="text-white/50 text-sm leading-relaxed mb-6">
              Transforming spaces into experiences. AI-powered interior design for the modern home.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-white/40 hover:text-accent transition-colors"><Facebook size={20} /></a>
              <a href="#" className="text-white/40 hover:text-accent transition-colors"><Twitter size={20} /></a>
              <a href="#" className="text-white/40 hover:text-accent transition-colors"><Instagram size={20} /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-medium mb-6">Quick Links</h4>
            <ul className="space-y-4">
              <li><Link to="/" className="text-white/50 hover:text-accent text-sm transition-colors">Home</Link></li>
              <li><Link to="/upload" className="text-white/50 hover:text-accent text-sm transition-colors">Design Studio</Link></li>
              <li><Link to="/booking" className="text-white/50 hover:text-accent text-sm transition-colors">Furniture Shop</Link></li>
              <li><Link to="/dashboard" className="text-white/50 hover:text-accent text-sm transition-colors">My Projects</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white font-medium mb-6">Services</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-white/50 hover:text-accent text-sm transition-colors">AI Visualization</a></li>
              <li><a href="#" className="text-white/50 hover:text-accent text-sm transition-colors">AR Furniture Placement</a></li>
              <li><a href="#" className="text-white/50 hover:text-accent text-sm transition-colors">Smart Recommendations</a></li>
              <li><a href="#" className="text-white/50 hover:text-accent text-sm transition-colors">Expert Consultation</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-medium mb-6">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <MapPin size={18} className="text-accent shrink-0" />
                <span className="text-white/50 text-sm">123 Design Street, Creative Hub, Bangalore, India</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone size={18} className="text-accent shrink-0" />
                <span className="text-white/50 text-sm">+91 98765 43210</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail size={18} className="text-accent shrink-0" />
                <span className="text-white/50 text-sm">hello@gruhaalankara.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/30 text-xs">
            © {new Date().getFullYear()} Gruha Alankara. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <a href="#" className="text-white/30 hover:text-white text-xs transition-colors">Privacy Policy</a>
            <a href="#" className="text-white/30 hover:text-white text-xs transition-colors">Terms of Service</a>
            <a href="#" className="text-white/30 hover:text-white text-xs transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
