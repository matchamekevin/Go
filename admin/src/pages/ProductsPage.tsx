import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Package, DollarSign } from 'lucide-react';

const ProductsPage: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Mock data
  const products = [
    {
      id: 1,
      product_code: 'TKT_SIMPLE',
      name: 'Ticket Simple',
      description: 'Ticket pour un trajet simple',
      price: 250,
      category: 'T250',
      is_active: true,
      created_at: '2024-01-15',
      usage_count: 1250,
    },
    {
      id: 2,
      product_code: 'TKT_JOURNEE',
      name: 'Ticket Journée',
      description: 'Ticket valable toute la journée',
      price: 500,
      category: 'T500',
      is_active: true,
      created_at: '2024-01-15',
      usage_count: 324,
    },
    {
      id: 3,
      product_code: 'TKT_HEBDO',
      name: 'Ticket Hebdomadaire',
      description: 'Ticket valable une semaine',
      price: 2500,
      category: 'T2500',
      is_active: false,
      created_at: '2024-02-01',
      usage_count: 45,
    },
  ];

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <span className="status-badge status-active">Actif</span>
    ) : (
      <span className="status-badge status-inactive">Inactif</span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestion des produits</h1>
            <p className="mt-2 text-sm text-gray-600">
              Gérez les types de tickets et leurs tarifs
            </p>
          </div>
          <button 
            className="btn btn-primary flex items-center"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus className="h-5 w-5 mr-2" />
            Nouveau produit
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="stat-card">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total produits</p>
              <p className="text-2xl font-semibold text-gray-900">{products.length}</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Package className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Actifs</p>
              <p className="text-2xl font-semibold text-gray-900">
                {products.filter(p => p.is_active).length}
              </p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Revenus moyens</p>
              <p className="text-2xl font-semibold text-gray-900">
                {Math.round(products.reduce((sum, p) => sum + p.price, 0) / products.length)} FCFA
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.id} className="card hover-lift">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-gray-900">{product.name}</h3>
                  <p className="text-sm text-gray-500">{product.product_code}</p>
                </div>
              </div>
              {getStatusBadge(product.is_active)}
            </div>

            <p className="text-gray-600 mb-4">{product.description}</p>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">Prix</span>
                <span className="text-lg font-semibold text-gray-900">{product.price} FCFA</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">Catégorie</span>
                <span className="text-sm text-gray-900">{product.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">Utilisations</span>
                <span className="text-sm text-gray-900">{product.usage_count.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">Créé le</span>
                <span className="text-sm text-gray-900">
                  {new Date(product.created_at).toLocaleDateString('fr-FR')}
                </span>
              </div>
            </div>

            <div className="flex space-x-2 pt-4 border-t border-gray-200">
              <button className="flex-1 btn btn-secondary text-sm py-2 flex items-center justify-center">
                <Edit2 className="h-4 w-4 mr-1" />
                Modifier
              </button>
              <button className="flex-1 btn btn-secondary text-sm py-2 flex items-center justify-center text-red-600 hover:text-red-700">
                <Trash2 className="h-4 w-4 mr-1" />
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de création */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Nouveau produit</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Code produit
                  </label>
                  <input
                    type="text"
                    className="input"
                    placeholder="TKT_NOUVEAU"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom du produit
                  </label>
                  <input
                    type="text"
                    className="input"
                    placeholder="Nom du ticket"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    className="input"
                    rows={3}
                    placeholder="Description du produit"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prix (FCFA)
                  </label>
                  <input
                    type="number"
                    className="input"
                    placeholder="250"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Catégorie
                  </label>
                  <select className="input">
                    <option value="">Sélectionner une catégorie</option>
                    <option value="T100">T100</option>
                    <option value="T150">T150</option>
                    <option value="T200">T200</option>
                    <option value="T250">T250</option>
                    <option value="T300">T300</option>
                  </select>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                    Produit actif
                  </label>
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 btn btn-secondary"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 btn btn-primary"
                  >
                    Créer
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
