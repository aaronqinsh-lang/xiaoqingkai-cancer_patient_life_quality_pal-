
import React from 'react';
import { Category } from '../types';
import { getIcon, COLORS } from '../constants';
import { ChevronRight } from 'lucide-react';

interface CategoryCardProps {
  category: Category;
  onClick: (id: string) => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, onClick }) => {
  return (
    <button
      onClick={() => onClick(category.id)}
      className="group relative p-6 rounded-[2rem] bg-white crackle-border shadow-glaze transition-all duration-500 hover:shadow-glaze-hover hover:-translate-y-2 text-left flex flex-col items-start overflow-hidden card-glaze"
    >
      {/* 釉面反光感渐变装饰 */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-celadon-50 to-transparent rounded-full -mr-16 -mt-16 opacity-50 transition-transform group-hover:scale-125 duration-700 pointer-events-none" />
      
      <div className="mb-5 p-3.5 rounded-2xl bg-celadon-50 text-celadon-900 group-hover:bg-celadon-100 transition-colors duration-300 relative z-10">
        {getIcon(category.icon, "w-6 h-6")}
      </div>
      
      <div className="flex justify-between items-start w-full relative z-10">
        <h3 className="text-lg font-bold mb-2 text-slate-800 group-hover:text-celadon-900 transition-colors">
          {category.title}
        </h3>
        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-50 group-hover:bg-celadon-50 transition-all duration-300">
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-celadon-600 group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>

      <p className="text-xs text-slate-500 leading-relaxed mb-5 line-clamp-2 font-medium relative z-10">
        {category.description}
      </p>

      <div className="flex flex-wrap gap-2 mt-auto relative z-10">
        {category.subtopics.slice(0, 3).map((topic, i) => (
          <span key={i} className="text-[10px] bg-white/80 backdrop-blur-sm text-celadon-900 px-3 py-1 rounded-full border border-celadon-100 font-bold shadow-sm">
            {topic}
          </span>
        ))}
      </div>
    </button>
  );
};

export default CategoryCard;
