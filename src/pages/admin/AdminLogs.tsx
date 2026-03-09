import React from 'react';

const AdminLogs: React.FC = () => {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-foreground mb-6">
        <span className="gradient-text">Logs</span>
      </h1>
      <div className="flex items-center justify-center h-48 text-muted-foreground text-sm border border-dashed border-border rounded-xl">
        L'audit trail sera disponible prochainement (P1-03).
      </div>
    </div>
  );
};

export default AdminLogs;
