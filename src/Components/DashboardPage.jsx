import React from 'react';
import TopCards from './TopCards';
import SummaryPanel from './SummaryPanel';


 function DashboardPage(){
  return (
    <div className="p-6 space-y-6">
      <div className="card p-6 bg-gradient-to-r from-pink-400 to-orange-400 text-white">
        <h2 className="text-xl">Daily Overview</h2>
        <p className="mt-3">Quick summary for today</p>
      </div>

      <TopCards/>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Receipts</h3>
          <div className="text-sm text-gray-500">No receipts yet — add orders to see history</div>
        </div>

        <SummaryPanel/>
      </div>
    </div>
  );
}
export default DashboardPage ;