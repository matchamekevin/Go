import React from 'react';

const EditLineModal: React.FC<any> = (props) => {
  if (!props.isOpen) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow">Édition de ligne (stub)</div>
    </div>
  );
};

export default EditLineModal;
