import React from 'react';
import { Edit, Trash2, MapPin } from 'lucide-react';
import { Button } from '../../../shared/components/Button';

interface Line {
  id: number;
  name: string;
  color: string;
  active: boolean;
  stops?: any[];
}

interface LineCardProps {
  line: Line;
  onEdit: () => void;
  onDelete: () => void;
}

export const LineCard: React.FC<LineCardProps> = ({ line, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div 
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: line.color }}
          />
          <h3 className="font-semibold text-gray-900">{line.name}</h3>
        </div>
        <div className="flex space-x-1">
          <Button
            variant="secondary"
            size="sm"
            onClick={onEdit}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={onDelete}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center text-sm text-gray-600">
          <MapPin className="w-4 h-4 mr-1" />
          {line.stops?.length || 0} arrêts
        </div>
        
        <div className="flex items-center justify-between">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            line.active 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {line.active ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>
    </div>
  );
};