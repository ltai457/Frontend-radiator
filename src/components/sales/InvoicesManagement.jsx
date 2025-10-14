import React, { useState, useMemo } from "react";
import { FileText, Plus, Search, X } from "lucide-react";
import { useInvoices } from "../../hooks/useInvoices";
import { useModal } from "../../hooks/useModal";
import { PageHeader } from "../common/layout/PageHeader";
import { LoadingSpinner } from "../common/ui/LoadingSpinner";
import { Button } from "../common/ui/Button";
import { EmptyState } from "../common/layout/EmptyState";
import InvoiceTable from "./InvoiceTable";
import InvoiceDetailsModal from "./modals/InvoiceDetailsModal";
import QuickInvoiceModal from "./modals/QuickInvoiceModal";

const InvoicesManagement = () => {
  const {
    invoices,
    loading,
    error,
    createInvoice,
    getInvoiceById,
  } = useInvoices();

  const createModal = useModal();
  const detailsModal = useModal();

  // Search filter state
  const [searchTerm, setSearchTerm] = useState("");

  // Filtered invoices based on search
  const filteredInvoices = useMemo(() => {
    if (!searchTerm.trim()) return invoices;

    const search = searchTerm.toLowerCase();
    return invoices.filter((invoice) => {
      return (
        invoice.invoiceNumber?.toLowerCase().includes(search) ||
        invoice.customer?.fullName?.toLowerCase().includes(search) ||
        invoice.customer?.company?.toLowerCase().includes(search) ||
        invoice.customer?.email?.toLowerCase().includes(search)
      );
    });
  }, [invoices, searchTerm]);

  const handleCreateInvoice = async (invoiceData) => {
    const result = await createInvoice(invoiceData);
    if (result.success) {
      createModal.closeModal();
      // Optionally show the newly created invoice
      if (result.data) {
        detailsModal.openModal(result.data);
      }
      return true;
    }
    return false;
  };

  const handleViewDetails = async (invoice) => {
    // If we have all the data already, just open the modal
    if (invoice.items && invoice.items.length > 0) {
      detailsModal.openModal(invoice);
    } else {
      // Otherwise fetch full details
      const result = await getInvoiceById(invoice.id);
      if (result.success) {
        detailsModal.openModal(result.data);
      } else {
        alert("Failed to load invoice details: " + result.error);
      }
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  // Calculate summary stats
  const totalInvoiced = useMemo(() => {
    return filteredInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
  }, [filteredInvoices]);

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading invoices..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoices"
        icon={FileText}
        actions={
          <Button onClick={() => createModal.openModal()} icon={Plus}>
            New Invoice
          </Button>
        }
      />

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">Total Invoices</div>
          <div className="text-2xl font-bold text-gray-900">{filteredInvoices.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">Total Value</div>
          <div className="text-2xl font-bold text-green-600">
            ${totalInvoiced.toLocaleString('en-NZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">Average Invoice</div>
          <div className="text-2xl font-bold text-blue-600">
            ${filteredInvoices.length > 0
              ? (totalInvoiced / filteredInvoices.length).toLocaleString('en-NZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
              : '0.00'}
          </div>
        </div>
      </div>

      {/* Search bar */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by invoice number, customer name, company, or email..."
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        {searchTerm && (
          <div className="mt-2 text-sm text-gray-600">
            Found {filteredInvoices.length} invoice{filteredInvoices.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {filteredInvoices.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={searchTerm ? "No invoices found" : "No invoices yet"}
          description={
            searchTerm
              ? "No invoices match your search"
              : "Start by creating your first invoice"
          }
          action={searchTerm}
          actionLabel="Clear search"
          onAction={clearSearch}
        />
      ) : (
        <InvoiceTable
          invoices={filteredInvoices}
          onViewDetails={handleViewDetails}
        />
      )}

      {/* Modals */}
      <QuickInvoiceModal
        isOpen={createModal.isOpen}
        onClose={createModal.closeModal}
        onSubmit={handleCreateInvoice}
      />

      <InvoiceDetailsModal
        isOpen={detailsModal.isOpen}
        onClose={detailsModal.closeModal}
        invoice={detailsModal.data}
      />
    </div>
  );
};

export default InvoicesManagement;
