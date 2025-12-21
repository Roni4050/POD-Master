
import React from 'react';
import { FileItem, Market } from '../types';
import MetadataCard from './MetadataCard';

interface MetadataGridProps {
  files: FileItem[];
  market: Market;
  onRegenerate: (item: FileItem) => void;
  onRemove: (id: string) => void;
}

const MetadataGrid: React.FC<MetadataGridProps> = ({ files, market, onRegenerate, onRemove }) => {
  if (files.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-6 pb-20">
      {files.map((item) => (
        <MetadataCard 
          key={item.id} 
          item={item} 
          market={market} 
          onRegenerate={() => onRegenerate(item)}
          onRemove={() => onRemove(item.id)}
        />
      ))}
    </div>
  );
};

export default MetadataGrid;
