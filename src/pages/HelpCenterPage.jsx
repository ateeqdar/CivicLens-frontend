import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { motion } from 'framer-motion';
import { MessageSquare, BookOpen, LifeBuoy, Lightbulb, Search } from 'lucide-react';

const HelpCenterPage = () => {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-black text-slate-900 tracking-tight mb-10">Help Center</h1>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-100 border border-slate-100 space-y-8"
        >
          <div className="relative mb-8">
            <input 
              type="text" 
              placeholder="Search for articles or FAQs..." 
              className="w-full p-5 pl-16 bg-slate-50 rounded-2xl border-2 border-slate-100 text-lg font-medium text-slate-900 focus:ring-4 focus:ring-primary-50 outline-none shadow-sm"
            />
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-400" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* FAQ Section */}
            <div className="flex items-start gap-6 p-6 bg-primary-50 rounded-2xl border border-primary-100">
              <div className="p-4 bg-primary-100 rounded-xl">
                <BookOpen className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Frequently Asked Questions</h3>
                <p className="text-slate-500 mt-1">Find quick answers to common queries about reporting issues.</p>
                <button className="mt-4 text-primary-600 font-bold hover:underline">View FAQs &rarr;</button>
              </div>
            </div>

            {/* Contact Support */}
            <div className="flex items-start gap-6 p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
              <div className="p-4 bg-emerald-100 rounded-xl">
                <LifeBuoy className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Contact Support</h3>
                <p className="text-slate-500 mt-1">Can't find what you're looking for? Get in touch with us.</p>
                <button className="mt-4 text-emerald-600 font-bold hover:underline">Get Support &rarr;</button>
              </div>
            </div>

            {/* How-to Guides */}
            <div className="flex items-start gap-6 p-6 bg-purple-50 rounded-2xl border border-purple-100">
              <div className="p-4 bg-purple-100 rounded-xl">
                <Lightbulb className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">How-to Guides</h3>
                <p className="text-slate-500 mt-1">Step-by-step instructions on using CivicLens features.</p>
                <button className="mt-4 text-purple-600 font-bold hover:underline">Browse Guides &rarr;</button>
              </div>
            </div>

            {/* Feedback & Suggestions */}
            <div className="flex items-start gap-6 p-6 bg-orange-50 rounded-2xl border border-orange-100">
              <div className="p-4 bg-orange-100 rounded-xl">
                <MessageSquare className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Feedback & Suggestions</h3>
                <p className="text-slate-500 mt-1">Help us improve CivicLens by sharing your thoughts.</p>
                <button className="mt-4 text-orange-600 font-bold hover:underline">Give Feedback &rarr;</button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default HelpCenterPage;
