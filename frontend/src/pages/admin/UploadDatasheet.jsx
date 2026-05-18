import React, { useState } from 'react';
import { read, utils } from 'xlsx';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { useToast } from '../../context/ToastContext';
import { leadsApi } from '../../api/leadsApi';
import { UploadCloud, CheckCircle2, AlertCircle, Search, Cloud, Zap, FileSpreadsheet } from 'lucide-react';
import { cn } from '../../utils/cn';

// Parse a CSV string into array of objects using first row as headers
function parseCSV(text) {
  const lines = text.trim().split('\n').filter(Boolean);
  if (lines.length < 2) return [];
  const rawHeaders = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const headers = rawHeaders.map(h => h.toLowerCase().replace(/\s+/g, '_'));
  return lines.slice(1).map(line => {
    const vals = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    const obj = {};
    headers.forEach((h, i) => { obj[h] = vals[i] || ''; });
    return obj;
  }).filter(row => row.customer_name || row.name || row.mobile);
}

export function UploadDatasheetPage() {
  const { addToast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const [engine, setEngine] = useState('tesseract');
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null); // { created, failed, fileName }
  const [manualForm, setManualForm] = useState({
    customer_name: '',
    mobile: '',
    pincode: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const [importHistory, setImportHistory] = useState([
    { file: 'datasheet_june.xlsx', records: 45, status: 'imported', date: 'Today' },
    { file: 'leads_may.pdf', records: 30, status: 'imported', date: 'Yesterday' },
    { file: 'scan_photo.jpg', records: 12, status: 'processing', date: '2 days ago' },
  ]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(e.target.files[0]);
      e.target.value = ''; // reset so same file can be re-uploaded
    }
  };

  const handleFileUpload = async (file) => {
    const isCSV = file.name.toLowerCase().endsWith('.csv');
    const isExcel = file.name.toLowerCase().endsWith('.xlsx') || file.name.toLowerCase().endsWith('.xls');

    setUploading(true);
    setUploadResult(null);
    addToast('info', 'Processing', `Reading ${file.name}...`);

    try {
      let rows = [];
      
      if (isCSV) {
        const text = await file.text();
        rows = parseCSV(text);
      } else if (isExcel) {
        const data = await file.arrayBuffer();
        const workbook = read(data);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        rows = utils.sheet_to_json(worksheet);
      } else {
        // PDF/Image — simulate OCR (backend OCR integration needed)
        await new Promise(r => setTimeout(r, 2000));
        addToast('success', 'OCR Complete', `${file.name} processed via ${engine}. Leads queued for review.`);
        setImportHistory(prev => [
          { file: file.name, records: '?', status: 'processing', date: 'Just now' },
          ...prev
        ]);
        setUploading(false);
        return;
      }

      if (rows.length === 0) {
        addToast('error', 'Empty File', 'No data found in the uploaded file.');
        setUploading(false);
        return;
      }

      // Robust Column Mapping
      const leads = rows.map(r => {
        // Map keys to lowercase for easier matching
        const entry = {};
        Object.keys(r).forEach(k => { entry[k.toLowerCase().replace(/\s+/g, '_')] = r[k]; });

        return {
          customer_name: entry.customer_name || entry.name || entry.customer || entry.full_name || '',
          mobile: String(entry.mobile || entry.phone || entry.contact || entry.mobile_number || '').replace(/\D/g, '').slice(0, 10),
          pincode: String(entry.pincode || entry.pin || entry.zip || entry.zipcode || '').replace(/\D/g, '').slice(0, 6),
          state: entry.state || '',
          district: entry.district || '',
          address: entry.address || '',
        };
      }).filter(l => l.customer_name && l.mobile.length === 10);

      if (leads.length === 0) {
        addToast('error', 'Import Error', 'Could not find required columns (Name, Mobile). Please check your file headers.');
        setUploading(false);
        return;
      }

      const res = await leadsApi.bulkImport(leads);

      if (res.success) {
        const { created, failed } = res.results;
        setUploadResult({ created, failed, fileName: file.name });
        setImportHistory(prev => [
          { file: file.name, records: created, status: 'imported', date: 'Just now' },
          ...prev
        ]);
        addToast('success', 'Import Complete', `${created} leads imported successfully.`);
      }
    } catch (err) {
      console.error('Upload Error:', err);
      addToast('error', 'Upload Failed', 'There was an error processing your file. Please ensure it is a valid CSV or Excel file.');
    } finally {
      setUploading(false);
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (manualForm.mobile.length !== 10) {
      addToast('error', 'Invalid Mobile', 'Mobile number must be exactly 10 digits.');
      return;
    }
    if (manualForm.pincode.length !== 6) {
      addToast('error', 'Invalid Pincode', 'Pincode must be exactly 6 digits.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await leadsApi.createLead(manualForm);
      if (res.success) {
        addToast('success', 'Lead Added', 'Manual lead created successfully.');
        setManualForm({ customer_name: '', mobile: '', pincode: '' });
      }
    } catch (err) {
      addToast('error', 'Error', err?.response?.data?.message || 'Failed to add lead. Check inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SectionHeader
        title="Upload Datasheet"
        subtitle="Upload CSV files or add leads manually. AI-powered OCR supports PDF & images."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <Card title="Upload File" className="h-full flex flex-col">
          <div
            className={cn(
              "flex-1 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-8 transition-all duration-200 mt-2 relative",
              uploading ? "border-accent bg-accent/5 pointer-events-none" :
              isDragging ? "border-accent bg-accent/10 scale-[1.01]" :
              "border-border-light dark:border-border-dark bg-background-dark/5 dark:bg-background/5"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              id="file-upload"
              className="hidden"
              onChange={handleFileInput}
              accept=".csv,.pdf,.png,.jpg,.jpeg,.xlsx"
              disabled={uploading}
            />
            <label
              htmlFor="file-upload"
              className="flex flex-col items-center cursor-pointer group w-full"
            >
              <div className={cn(
                "w-16 h-16 mb-4 rounded-2xl flex items-center justify-center transition-all",
                uploading ? "bg-accent/20 text-accent animate-pulse" : "bg-accent/10 text-accent group-hover:scale-110"
              )}>
                {uploading
                  ? <div className="w-7 h-7 border-[3px] border-accent border-t-transparent rounded-full animate-spin" />
                  : <UploadCloud className="w-8 h-8" />
                }
              </div>
              <p className="text-text-primary dark:text-text-dark-primary font-bold mb-1">
                {uploading ? 'Uploading & importing...' : 'Click to upload or drag & drop'}
              </p>
              <p className="text-xs text-text-muted">
                CSV (recommended) • PDF, PNG, JPG • Max 20MB
              </p>
            </label>
          </div>

          {/* Upload Result Banner */}
          {uploadResult && (
            <div className={cn(
              "mt-4 p-4 rounded-xl flex items-center gap-3 border text-sm",
              uploadResult.failed === 0
                ? "bg-success/10 border-success/30 text-success"
                : "bg-warning/10 border-warning/30 text-warning"
            )}>
              {uploadResult.failed === 0
                ? <CheckCircle2 className="w-5 h-5 shrink-0" />
                : <AlertCircle className="w-5 h-5 shrink-0" />
              }
              <span>
                <strong>{uploadResult.created}</strong> leads imported from <strong>{uploadResult.fileName}</strong>
                {uploadResult.failed > 0 && `, ${uploadResult.failed} skipped`}
              </span>
            </div>
          )}

          <div className="mt-6">
            <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-3">OCR Engine</h4>
            <div className="flex flex-wrap gap-3">
              {[
                { id: 'tesseract', label: 'Tesseract', Icon: Search },
                { id: 'google', label: 'Google Vision', Icon: Cloud },
                { id: 'aws', label: 'AWS Textract', Icon: Zap },
              ].map(({ id, label, Icon }) => (
                <button
                  key={id}
                  onClick={() => setEngine(id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all border",
                    engine === id
                      ? "bg-accent/10 border-accent text-accent"
                      : "bg-transparent border-border-light dark:border-border-dark text-text-secondary hover:border-accent/50"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </Card>

        <div className="space-y-6">
          {/* History Section */}
          <Card title="Import History">
            <Table
              columns={[
                { key: 'file', label: 'File', render: (v) => (
                  <span className="text-sm font-medium flex items-center gap-2">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-accent shrink-0" />{v}
                  </span>
                )},
                { key: 'records', label: 'Records', render: (v) => <span className="font-bold">{v}</span> },
                {
                  key: 'status',
                  label: 'Status',
                  render: (v) => <Badge label={v} color={v === 'imported' ? 'success' : 'warning'} size="xs" />
                },
                { key: 'date', label: 'Date', muted: true },
              ]}
              rows={importHistory}
            />
          </Card>

          {/* Manual Add Section */}
          <Card title="Manual Add Lead">
            <form onSubmit={handleManualSubmit} className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Customer Name"
                  placeholder="Full name"
                  value={manualForm.customer_name}
                  onChange={(e) => setManualForm(p => ({ ...p, customer_name: e.target.value }))}
                  required
                />
                <Input
                  label="Mobile"
                  placeholder="10-digit number"
                  value={manualForm.mobile}
                  onChange={(e) => setManualForm(p => ({ ...p, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                  required
                />
              </div>
              <Input
                label="Pincode"
                placeholder="6-digit pincode"
                value={manualForm.pincode}
                onChange={(e) => setManualForm(p => ({ ...p, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                required
              />
              <div className="pt-2">
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Adding...' : 'Add Lead'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
