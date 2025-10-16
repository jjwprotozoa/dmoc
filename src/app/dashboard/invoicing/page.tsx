// src/app/dashboard/invoicing/page.tsx
'use client';

import { Calendar, DollarSign, FileText, Receipt, TrendingUp } from 'lucide-react';

export default function InvoicingPage() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <Receipt className="w-8 h-8 text-amber-600" />
          <h1 className="text-3xl font-bold text-gray-900">Invoicing</h1>
        </div>
        <p className="text-gray-600">Manage billing, invoices, and financial transactions</p>
      </div>

      {/* Placeholder Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Billing Management</h2>
          <p className="text-gray-600 mb-6">
            This page will handle invoice generation, payment tracking, 
            and financial reporting for all logistics operations.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            <div className="bg-gray-50 p-4 rounded-lg">
              <FileText className="w-6 h-6 text-amber-600 mb-2" />
              <h3 className="font-medium text-gray-900">Invoice Generation</h3>
              <p className="text-sm text-gray-600">Create and manage invoices for clients</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <Calendar className="w-6 h-6 text-amber-600 mb-2" />
              <h3 className="font-medium text-gray-900">Payment Tracking</h3>
              <p className="text-sm text-gray-600">Monitor payment status and due dates</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <TrendingUp className="w-6 h-6 text-amber-600 mb-2" />
              <h3 className="font-medium text-gray-900">Financial Reports</h3>
              <p className="text-sm text-gray-600">Generate revenue and expense reports</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
