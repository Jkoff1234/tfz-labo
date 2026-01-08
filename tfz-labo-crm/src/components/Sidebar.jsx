import React, { useState } from 'react';

const Sidebar = ({ activeSection, setActiveSection }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'DASHBOARD', icon: '📊' },
    { id: 'clients', label: 'GESTIONE CLIENTI', subItems: [
      { id: 'client-list', label: 'Lista Clienti' },
      { id: 'add-client', label: 'Aggiungi Nuovo' }
    ]},
    { id: 'subscriptions', label: 'ABBONAMENTI & LINEE', subItems: [
      { id: 'active-subs', label: 'Lista Abbonamenti Attivi' },
      { id: 'expiring', label: 'In Scadenza' },
      { id: 'expired', label: 'Storico Scaduti' }
    ]},
    { id: 'support', label: 'SUPPORTO & TICKET', subItems: [
      { id: 'open-tickets', label: 'Ticket Aperti' },
      { id: 'quick-replies', label: 'Risposte Rapide' }
    ]},
    { id: 'automation', label: 'AUTOMAZIONE & MESSAGGI', subItems: [
      { id: 'send-logs', label: 'Log Invii' },
      { id: 'reminder-settings', label: 'Impostazioni Reminder' }
    ]},
    { id: 'admin', label: 'AMMINISTRAZIONE', subItems: [
      { id: 'server-management', label: 'Gestione Server/Pannelli' },
      { id: 'stats-finance', label: 'Statistiche & Finanze' },
      { id: 'crm-settings', label: 'Impostazioni CRM' }
    ]}
  ];

  return (
    <div className={`bg-gray-900 text-white h-screen fixed left-0 top-0 z-10 transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}>
      <div className="p-4 border-b border-gray-700">
        <button onClick={() => setIsCollapsed(!isCollapsed)} className="text-white">
          {isCollapsed ? '▶' : '◀'}
        </button>
        {!isCollapsed && <h2 className="text-lg font-bold ml-2">TFZ Labo CRM</h2>}
      </div>
      <nav className="p-4">
        {menuItems.map(item => (
          <div key={item.id}>
            <button
              onClick={() => setActiveSection(item.id)}
              className={`w-full text-left py-2 px-3 rounded mb-1 ${activeSection === item.id ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
            >
              {item.icon} {!isCollapsed && item.label}
            </button>
            {!isCollapsed && item.subItems && (
              <div className="ml-4">
                {item.subItems.map(sub => (
                  <button
                    key={sub.id}
                    onClick={() => setActiveSection(sub.id)}
                    className={`w-full text-left py-1 px-3 rounded mb-1 text-sm ${activeSection === sub.id ? 'bg-blue-500' : 'hover:bg-gray-600'}`}
                  >
                    {sub.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;