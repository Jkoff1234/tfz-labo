import React from 'react';

const PlaceholderPage = ({ title }) => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-4">{title}</h1>
      <div className="bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
        <p className="text-gray-300">Questa sezione è in sviluppo. Verrà implementata a breve.</p>
        <div className="mt-4 p-4 bg-gray-700 rounded">
          <p className="text-gray-400">Funzionalità pianificate:</p>
          <ul className="list-disc list-inside mt-2 text-gray-300">
            <li>Interfaccia utente completa</li>
            <li>Integrazione con database Supabase</li>
            <li>Gestione dati in tempo reale</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PlaceholderPage;