import React, { useState, useEffect } from 'react';
import { Button } from '../../../shared/components/Button';

interface LineFormData {
  name: string;
  color: string;
  active: boolean;
}

interface LineFormProps {
  initialData?: Partial<LineFormData>;
  onSubmit: (data: LineFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const LineForm: React.FC<LineFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<LineFormData>({
    name: '',
    color: '#3B82F6',
    active: true,
    ...initialData
  });

  const [errors, setErrors] = useState<Partial<LineFormData>>({});

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  const validateForm = (): boolean => {
    const newErrors: Partial<LineFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom de la ligne est requis';
    }

    if (!formData.color) {
      newErrors.color = 'La couleur est requise';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleInputChange = (field: keyof LineFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Nom de la ligne */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
          Nom de la ligne *
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Ex: Ligne A"
          disabled={isLoading}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name}</p>
        )}
      </div>

      {/* Couleur */}
      <div>
        <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-2">
          Couleur *
        </label>
        <div className="flex items-center space-x-3">
          <input
            type="color"
            id="color"
            value={formData.color}
            onChange={(e) => handleInputChange('color', e.target.value)}
            className="w-12 h-10 border border-gray-300 rounded-md cursor-pointer"
            disabled={isLoading}
          />
          <input
            type="text"
            value={formData.color}
            onChange={(e) => handleInputChange('color', e.target.value)}
            className={`flex-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.color ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="#3B82F6"
            disabled={isLoading}
          />
        </div>
        {errors.color && (
          <p className="mt-1 text-sm text-red-600">{errors.color}</p>
        )}
      </div>

      {/* Status actif */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="active"
          checked={formData.active}
          onChange={(e) => handleInputChange('active', e.target.checked)}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          disabled={isLoading}
        />
        <label htmlFor="active" className="ml-2 text-sm text-gray-700">
          Ligne active
        </label>
      </div>

      {/* Aperçu */}
      <div className="bg-gray-50 p-4 rounded-md">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Aperçu</h4>
        <div className="flex items-center space-x-3">
          <div 
            className="w-4 h-4 rounded-full border"
            style={{ backgroundColor: formData.color }}
          />
          <span className="font-medium">{formData.name || 'Nom de la ligne'}</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            formData.active 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {formData.active ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isLoading}
        >
          Annuler
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? 'Enregistrement...' : 'Enregistrer'}
        </Button>
      </div>
    </form>
  );
};