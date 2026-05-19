import React, { useState, useEffect } from 'react';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { leadsApi } from '../../api/leadsApi';
import { useToast } from '../../context/ToastContext';
import { CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';

export function VerificationPage({ onNav }) {
  const [leads, setLeads] = useState([]);
  const [selectedLead, setSelectedLead] = useState('');
  const [pan, setPan] = useState('');
  const [pincode, setPincode] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [motherName, setMotherName] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const res = await leadsApi.getLeads({ limit: 100 });
        if (res.success) {
          // Filter to show leads that might need verification (newly assigned or in progress)
          const verifiableLeads = res.data.filter(l => 
            l.status === 'assigned' || 
            l.status === 'in_progress' || 
            l.status === 'new'
          );
          setLeads(verifiableLeads);
        }
      } catch (err) {
        addToast('error', 'Error', 'Failed to load leads for verification.');
      } finally {
        setLoading(false);
      }
    };
    fetchLeads();
  }, []);

  // Pre-fill fields when lead is selected
  useEffect(() => {
    if (selectedLead) {
      const lead = leads.find(l => l._id === selectedLead);
      if (lead) {
        setPincode(lead.pincode || '');
        setPan(lead.pan || '');
        setFatherName(lead.father_name || '');
        setMotherName(lead.mother_name || '');
        setStatus(lead.verification_status || '');
      }
    } else {
      setPincode('');
      setPan('');
      setFatherName('');
      setMotherName('');
      setStatus('');
    }
  }, [selectedLead, leads]);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!selectedLead || !pan || !pincode || !status || !fatherName || !motherName) {
      return addToast('warning', 'Required Fields', 'Please fill all fields.');
    }

    setVerifying(true);
    try {
      // 1. PAN Format Check
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      const isPanValid = panRegex.test(pan.toUpperCase().trim());

      if (!isPanValid) {
        setVerifying(false);
        return addToast('warning', 'Invalid PAN Format', 'Please enter a valid 10-character PAN (e.g., ABCDE1234F).');
      }

      // 2. Pincode Format Check
      const pincodeRegex = /^[0-9]{6}$/;
      const isPincodeValid = pincodeRegex.test(pincode.trim());

      if (!isPincodeValid) {
        setVerifying(false);
        return addToast('warning', 'Invalid Pincode Format', 'Please enter a valid 6-digit pincode.');
      }

      let newStatus = 'in_progress';
      let message = `Lead verification status updated to ${status}.`;
      let type = 'success';

      if (status === 'Listed pincode') {
        newStatus = 'eligible';
        message = 'Customer verified & marked as eligible. Redirecting to QD Form...';
      } else if (status === 'Not listed pincode') {
        newStatus = 'rejected';
        message = 'Lead marked as Rejected (pincode not serviceable).';
        type = 'error';
      } else if (status === 'Fresh') {
        newStatus = 'assigned';
      }

      // Update lead in backend (saving all verification fields)
      const res = await leadsApi.updateLead(selectedLead, { 
        status: newStatus,
        pan: pan.toUpperCase().trim(),
        pincode: pincode.trim(),
        father_name: fatherName.trim(),
        mother_name: motherName.trim(),
        verification_status: status,
        notes: `Verified as: ${status}`
      });
      
      if (res.success) {
        addToast(type, status, message);
        
        // Remove from current list if it is now eligible or rejected
        if (newStatus === 'eligible' || newStatus === 'rejected') {
          setLeads(leads.filter(l => l._id !== selectedLead));
        }

        setSelectedLead('');
        setPan('');
        setPincode('');
        setFatherName('');
        setMotherName('');
        setStatus('');

        // Redirect to QD Form if eligible
        if (newStatus === 'eligible' && onNav) {
          setTimeout(() => {
            onNav('sp-qd');
          }, 800);
        }
      }
    } catch (err) {
      addToast('error', 'Error', 'Verification process failed.');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SectionHeader
        title="PAN & Pincode Verification"
        subtitle="Validate customer details before proceeding to data collection"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Verification Form */}
        <Card title="Verify Customer">
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <form onSubmit={handleVerify} className="space-y-5 mt-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Lead / Customer</label>
                <Select 
                  value={selectedLead}
                  onChange={(e) => setSelectedLead(e.target.value)}
                  options={[
                    { value: '', label: 'Select a customer...' },
                    ...leads.map(l => ({ value: l._id, label: `${l.customer_name} — ${l.lead_number}` }))
                  ]}
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input 
                  label="PAN Number" 
                  placeholder="ABCDE1234F" 
                  value={pan}
                  onChange={(e) => setPan(e.target.value.toUpperCase())}
                  maxLength={10}
                  disabled={!selectedLead}
                />

                <Input 
                  label="Pincode" 
                  placeholder="6-digit pincode" 
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  maxLength={6}
                  disabled={!selectedLead}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input 
                  label="Father's Name" 
                  placeholder="Father's Full Name" 
                  value={fatherName}
                  onChange={(e) => setFatherName(e.target.value)}
                  disabled={!selectedLead}
                />

                <Input 
                  label="Mother's Name" 
                  placeholder="Mother's Full Name" 
                  value={motherName}
                  onChange={(e) => setMotherName(e.target.value)}
                  disabled={!selectedLead}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Verification Status</label>
                <Select 
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  options={[
                    { value: '', label: 'Select a status...' },
                    { value: 'Listed pincode', label: 'Listed pincode' },
                    { value: 'Not listed pincode', label: 'Not listed pincode' },
                    { value: 'Fresh', label: 'Fresh' },
                    { value: 'Followup', label: 'Followup' },
                    { value: 'Exceptional', label: 'Exceptional' }
                  ]}
                  className="w-full"
                  disabled={!selectedLead}
                />
              </div>

              <div className="pt-2">
                <Button 
                  type="submit" 
                  disabled={verifying || !selectedLead || !pan || !pincode || !status || !fatherName || !motherName}
                  icon={ShieldCheck}
                  className="w-full sm:w-auto"
                >
                  {verifying ? 'Generating QD...' : 'Generate QD ✓'}
                </Button>
              </div>
            </form>
          )}
        </Card>

        {/* Rules Panel */}
        <Card title="Verification Rules">
          <div className="mt-4 space-y-6">
            
            <div className="relative pl-6">
              <div className="absolute left-0 top-1.5 w-2.5 h-2.5 rounded-full bg-success"></div>
              <h4 className="font-bold text-sm text-text-primary dark:text-text-dark-primary">Listed Pincode</h4>
              <p className="text-xs text-text-muted mt-1">If the customer pincode is listed and serviceable, they will immediately be upgraded to <strong>Eligible</strong> stage to fill out the QD Form.</p>
            </div>

            <div className="relative pl-6">
              <div className="absolute left-0 top-1.5 w-2.5 h-2.5 rounded-full bg-danger"></div>
              <h4 className="font-bold text-sm text-text-primary dark:text-text-dark-primary">Not Listed Pincode</h4>
              <p className="text-xs text-text-muted mt-1">If the pincode is non-serviceable, select <strong>Not listed pincode</strong> to reject the lead.</p>
            </div>

            <div className="relative pl-6">
              <div className="absolute left-0 top-1.5 w-2.5 h-2.5 rounded-full bg-warning"></div>
              <h4 className="font-bold text-sm text-text-primary dark:text-text-dark-primary">Other Status Options</h4>
              <p className="text-xs text-text-muted mt-1">Use <strong>Fresh</strong>, <strong>Followup</strong>, or <strong>Exceptional</strong> as needed to track different verification stages.</p>
            </div>

          </div>
        </Card>

      </div>
    </div>
  );
}
