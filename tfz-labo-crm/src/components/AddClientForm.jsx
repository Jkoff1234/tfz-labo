import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

const AddClientForm = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone_whatsapp: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.full_name.trim()) {
      setMessage({ type: 'error', text: 'Il nome completo del cliente è obbligatorio' });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const { data, error } = await supabase
        .from('clients')
        .insert([
          {
            full_name: formData.full_name.trim(),
            email: formData.email.trim() || null,
            phone_whatsapp: formData.phone_whatsapp.trim() || null,
            notes: formData.notes.trim() || null
          }
        ]);

      if (error) throw error;

      setMessage({
        type: 'success',
        text: `Cliente "${formData.full_name}" aggiunto con successo!`
      });

      // Reset form
      setFormData({ full_name: '', email: '', phone_whatsapp: '', notes: '' });

      // Trigger refresh of data (if needed)
      window.dispatchEvent(new Event('data-updated'));

    } catch (error) {
      console.error('Errore inserimento cliente:', error);
      setMessage({
        type: 'error',
        text: `Errore durante l'inserimento: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Aggiungi Nuovo Cliente</h1>
        <p className="text-gray-400">Inserisci i dati del nuovo cliente nel sistema CRM</p>
      </div>

      <div className="bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-lg p-6 border border-gray-700 shadow-lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nome Cliente */}
          <div>
            <label htmlFor="full_name" className="block text-sm font-medium text-gray-300 mb-2">
              Nome Completo *
            </label>
            <input
              type="text"
              id="full_name"
              name="full_name"
              value={formData.full_name}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Inserisci il nome completo del cliente"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Email (Opzionale)
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="cliente@email.com"
            />
          </div>

          {/* Telefono WhatsApp */}
          <div>
            <label htmlFor="phone_whatsapp" className="block text-sm font-medium text-gray-300 mb-2">
              Telefono WhatsApp (Opzionale)
            </label>
            <input
              type="tel"
              id="phone_whatsapp"
              name="phone_whatsapp"
              value={formData.phone_whatsapp}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="+39 123 456 7890"
            />
          </div>

          {/* Note */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-300 mb-2">
              Note (Opzionale)
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows="3"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Note aggiuntive sul cliente..."
            />
          </div>

          {/* Pulsanti */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Salvando...
                </span>
              ) : (
                'Aggiungi Cliente'
              )}
            </button>

            <button
              type="button"
              onClick={() => setFormData({ full_name: '', email: '', phone_whatsapp: '', notes: '' })}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-800"
            >
              Reset
            </button>
          </div>
        </form>

        {/* Messaggi */}
        {message.text && (
          <div className={`mt-6 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-900 bg-opacity-50 border border-green-700 text-green-300'
              : 'bg-red-900 bg-opacity-50 border border-red-700 text-red-300'
          }`}>
            <div className="flex items-center">
              {message.type === 'success' ? (
                <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              )}
              {message.text}
            </div>
          </div>
        )}

        {/* Info aggiuntive */}
        <div className="mt-6 p-4 bg-blue-900 bg-opacity-20 border border-blue-700 rounded-lg">
          <h3 className="text-sm font-medium text-blue-300 mb-2">Informazioni</h3>
          <ul className="text-xs text-blue-200 space-y-1">
            <li>• Il campo "Nome" è obbligatorio</li>
            <li>• Il campo "Contatto" è opzionale ma consigliato per le comunicazioni</li>
            <li>• Una volta aggiunto, il cliente apparirà nella lista clienti</li>
            <li>• Potrai aggiungere abbonamenti al cliente dalla sezione dedicata</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AddClientForm;