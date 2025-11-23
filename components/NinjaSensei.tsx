import React from 'react';
import { SystemStatus } from '../types';

interface SystemLogProps {
  status: SystemStatus | null;
  loading: boolean;
}

export const NinjaSensei: React.FC<SystemLogProps> = ({ status, loading }) => {
  if (!status && !loading) return null;

  return (
    <div className="w-full max-w-md mb-8 relative group">
        {/* Speech Bubble Tail visual hack if we wanted it, but caption box is better for 'system' */}
        
        <div className="manga-panel p-0 overflow-hidden">
            {/* Header Strip */}
            <div className="bg-black text-white p-2 flex justify-between items-center border-b-2 border-black">
                <span className="manga-font text-lg tracking-widest ml-1">
                   {loading ? '加载中...' : `// ${status?.module || 'SYSTEM'}`}
                </span>
                <div className="flex gap-1">
                    <div className="w-3 h-3 bg-white rounded-full border border-black"></div>
                    <div className="w-3 h-3 bg-black border border-white rounded-full"></div>
                </div>
            </div>

            <div className="p-6 relative min-h-[100px] flex items-center justify-center bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNCIgaGVpZ2h0PSI0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxjaXJjbGUgY3g9IjIiIGN5PSIyIiByPSIxIiBmaWxsPSIjZTVlNWU1Ii8+PC9zdmc+')]">
                {loading ? (
                    <div className="text-center">
                         <p className="font-bold text-xl animate-pulse">
                            访问档案中...
                         </p>
                    </div>
                ) : (
                    <div className="relative z-10">
                        <p className="font-bold text-lg leading-relaxed text-center font-sans">
                            "{status?.message}"
                        </p>
                        {/* Decorative quotes */}
                        <span className="absolute -top-4 -left-2 text-6xl font-serif opacity-20">“</span>
                        <span className="absolute -bottom-8 -right-2 text-6xl font-serif opacity-20">”</span>
                    </div>
                )}
            </div>
        </div>
        
        {/* Drop shadow offset block */}
        <div className="absolute -bottom-2 -right-2 w-full h-full bg-black -z-10"></div>
    </div>
  );
};