import React from 'react';
// Accept a flexible line type to be compatible with both service and shared types
type AnySotralLine = any;

interface LineTableProps {
  lines: AnySotralLine[];
  loading?: boolean;
  onDetailsClick: (line: AnySotralLine) => void;
  onEditClick?: (line: AnySotralLine) => void;
  onDeleteClick?: (line: AnySotralLine) => void;
  onToggleStatus?: (id: number) => Promise<any>;
}

const LineTable: React.FC<LineTableProps> = ({ lines, onDetailsClick }) => {
  return (
    <div className="glass-container rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Lignes de transport</h2>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ligne
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Itinéraire
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Distance
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Arrêts
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Catégorie
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              {/* Actions column removed */}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {lines.map((line) => (
              <tr 
                key={line.id} 
                className="cursor-pointer transition-colors duration-200"
                onClick={() => onDetailsClick(line)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary-800">
                          {line.line_number}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        Ligne {line.line_number}
                      </div>
                      <div className="text-sm text-gray-500">
                        {line.line_name || (line as any).name}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {line.route_from} ↔ {line.route_to}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {line.distance_km} km
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {line.stops_count}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    ((line as any).category?.name === 'Lignes étudiantes') 
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {(line as any).category?.name || 'Ordinaire'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    line.is_active 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {line.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                {/* Actions cell removed */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LineTable;
