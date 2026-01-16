import React from 'react';
import { HistoryItem } from '../types';

interface HistoryListProps {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onClear: () => void;
}

export const HistoryList: React.FC<HistoryListProps> = ({ history, onSelect, onClear }) => {
  if (history.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8 bg-white rounded-lg shadow-sm border border-gray-200">
        <p>Nenhum histórico disponível.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
        <h3 className="font-bold text-gray-700">Histórico Recente</h3>
        <button 
          onClick={onClear}
          className="text-xs text-red-600 hover:text-red-800 font-medium underline"
        >
          Limpar
        </button>
      </div>
      <ul className="divide-y divide-gray-100 max-h-64 overflow-y-auto">
        {history.map((item) => (
          <li 
            key={item.id} 
            onClick={() => onSelect(item)}
            className="p-3 hover:bg-blue-50 cursor-pointer transition-colors flex items-center gap-3"
          >
            <div className="h-10 w-10 flex-shrink-0 rounded bg-gray-200 overflow-hidden border border-gray-300">
              <img src={item.thumbnail} alt="thumb" className="h-full w-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {item.text.substring(0, 30) || "Sem texto detectado"}...
              </p>
              <p className="text-xs text-gray-500">
                {new Date(item.timestamp).toLocaleString('pt-BR')}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};