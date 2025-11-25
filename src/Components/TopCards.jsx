import React from 'react';

function Card({ title, value, icon }) {
  return (
    <div className="card p-6 flex items-center justify-between">
      <div>
        <div className="text-sm text-gray-400">{title}</div>
        <div className="text-2xl font-semibold mt-2">{value}</div>
      </div>
      <div className="text-4xl opacity-40">{icon}</div>
    </div>
  );
}

 function TopCards(){
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card title="Total sales Today" value="₹775.00" icon="📈" />
      <Card title="Total Bills Today" value="3" icon="💵" />
      <Card title="New customers" value="2" icon="👥" />
    </div>
  );
}
export default TopCards ;