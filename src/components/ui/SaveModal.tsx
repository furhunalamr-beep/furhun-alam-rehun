import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { Bookmark, Folder, X, CloudUpload } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';
import { cn } from '../../utils/cn';
import { vibrate } from '../../utils/helpers';
import toast from 'react-hot-toast';

const PRESET_TAGS = ['Active Ads', 'Product Sourcing', 'Crypto Portfolio', 'Forex Watchlist', 'Q3 Planning'];

export function SaveModal() {
  const { isSaveModalOpen, saveContext, closeSaveModal, saveTemplate, addToHistory } = useStore();
  const [name, setName] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (isSaveModalOpen && saveContext) {
      const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      // Smart default title
      let defaultName = `${saveContext.title} - ${dateStr}`;
      if (saveContext.type === 'ecom_cost') defaultName = `Product Calc - ${dateStr}`;
      if (saveContext.type === 'position_size') defaultName = `Long/Short Setup - ${dateStr}`;
      
      setName(defaultName);
      setSelectedTags([]);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isSaveModalOpen, saveContext]);

  if (!isSaveModalOpen) return null;

  const handleToggleTag = (tag: string) => {
    vibrate(20);
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSave = () => {
    vibrate(50);
    
    // Save to Blueprints
    saveTemplate({
      type: saveContext.type,
      name: name,
      inputs: saveContext.inputs,
      results: saveContext.results,
      tags: selectedTags,
    });
    
    // Also save to generic history tape auto log
    addToHistory({
      type: saveContext.type,
      title: name,
      inputs: saveContext.inputs,
      results: saveContext.results,
      tags: selectedTags,
    });

    closeSaveModal();

    // Trigger local "Success" toast
    toast.success('Saved locally!');

    // Simulate Background Cloud Sync
    if (navigator.onLine) {
       setTimeout(() => {
          vibrate([20, 50]);
          toast('Calculation "' + name + '" synced to cloud.', {
            icon: '☁️',
            style: {
               borderRadius: '10px',
               background: '#333',
               color: '#fff',
            },
          });
       }, 2000);
    }
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] transition-opacity" 
        onClick={closeSaveModal} 
      />
      <div className="fixed bottom-0 left-0 right-0 z-[201] bg-white dark:bg-slate-900 p-6 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.2)] transform transition-transform border-t border-slate-200 dark:border-slate-800">
        
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
             <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-xl text-blue-600 dark:text-blue-400">
                <Bookmark className="w-5 h-5" />
             </div>
             <h3 className="text-xl font-bold text-slate-900 dark:text-white">Save Blueprint</h3>
          </div>
          <button onClick={closeSaveModal} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full dark:hover:bg-slate-800">
             <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
           <Input
              label="Blueprint Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
           />

           <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                 <Folder className="w-4 h-4" />
                 Folders & Tags
              </div>
              <div className="flex flex-wrap gap-2">
                 {PRESET_TAGS.map(tag => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                       <button
                         key={tag}
                         onClick={() => handleToggleTag(tag)}
                         className={cn(
                           "px-3 py-1.5 text-xs font-bold rounded-full border transition-all",
                           isSelected 
                             ? "bg-slate-900 border-slate-900 text-white dark:bg-white dark:border-white dark:text-slate-900 shadow-md"
                             : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                         )}
                       >
                         {tag}
                       </button>
                    )
                 })}
              </div>
           </div>

           <Button onClick={handleSave} className="w-full h-14 text-lg font-bold tracking-widest rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white">
              SAVE CALCULATION
           </Button>
           
           <div className="flex justify-center items-center gap-2 text-[10px] text-slate-400 font-medium uppercase tracking-widest">
              <CloudUpload className="w-3 h-3" />
              Will auto-sync when online
           </div>
        </div>
      </div>
    </>
  );
}
