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

export function VerificationPage() {
  const [leads, setLeads] = useState([]);
  const [selectedLead, setSelectedLead] = useState('');
  const [pan, setPan] = useState('');
  const [pincode, setPincode] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const { addToast } = useToast();



  useEffect(() => {
    const fetchLeads = async () => {
      try {
        // In reality, filtered by agent and status 'in_progress'
        const res = await leadsApi.getLeads({ limit: 50 });
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

  // Pre-fill pincode when lead is selected
  useEffect(() => {
    if (selectedLead) {
      const lead = leads.find(l => l._id === selectedLead);
      if (lead) {
        setPincode(lead.pincode || '');
        setPan(''); // Reset PAN on new selection
        setStatus(''); // Reset status on new selection
      }
    }
  }, [selectedLead, leads]);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!selectedLead || !pan || !pincode || !status) {
      return addToast('warning', 'Required Fields', 'Please fill all fields.');
    }

    setVerifying(true);
    try {
      // 1. PAN Format Check (Regex for standard Indian PAN: 5 letters, 4 digits, 1 letter)
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      const isPanValid = panRegex.test(pan.toUpperCase().trim());

      if (!isPanValid) {
        setVerifying(false);
        return addToast('warning', 'Invalid PAN Format', 'Please enter a valid 10-character PAN (e.g., ABCDE1234F).');
      }

      // 2. Pincode Format Check (6-digit number check)
      const pincodeRegex = /^[0-9]{6}$/;
      const isPincodeValid = pincodeRegex.test(pincode.trim());

      if (!isPincodeValid) {
        setVerifying(false);
        return addToast('warning', 'Invalid Pincode Format', 'Please enter a valid 6-digit pincode.');
      }

      let newStatus = 'rejected';
      let message = `Lead marked as Rejected: ${status}`;
      let type = 'error';

      if (status === 'PAN Card and Pincode Verified') {
        newStatus = 'eligible';
        message = 'Customer is eligible. Proceed to QD Form.';
        type = 'success';
      }

      // Update lead in backend (saving status reason in notes)
      const res = await leadsApi.updateLead(selectedLead, { 
        status: newStatus,
        notes: status 
      });
      
      if (res.success) {
        addToast(type, newStatus === 'eligible' ? 'Verification Passed' : 'Lead Rejected', message);
        
        // Remove verified lead from dropdown
        setLeads(leads.filter(l => l._id !== selectedLead));
        setSelectedLead('');
        setPan('');
        setPincode('');
        setStatus('');
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

              <Input 
                label="PAN Number" 
                placeholder="ABCDE1234F" 
                value={pan}
                onChange={(e) => setPan(e.target.value.toUpperCase())}
                maxLength={10}
              />

              <Input 
                label="Pincode" 
                placeholder="6-digit pincode" 
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                maxLength={6}
              />

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Verification Status</label>
                <Select 
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  options={[
                    { value: '', label: 'Select a status...' },
                    { value: 'PAN Already Exists', label: 'PAN Already Exists' },
                    { value: 'Pincode Non-Serviceable', label: 'Pincode Non-Serviceable' },
                    { value: 'PAN Card Not Verified', label: 'PAN Card Not Verified' },
                    { value: 'PAN Card and Pincode Verified', label: 'PAN Card and Pincode Verified' }
                  ]}
                  className="w-full"
                />
              </div>

              <div className="pt-2">
                <Button 
                  type="submit" 
                  disabled={verifying || !selectedLead || !pan || !pincode || !status}
                  icon={ShieldCheck}
                >
                  {verifying ? 'Verifying...' : 'Verify Now'}
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
              <h4 className="font-bold text-sm text-text-primary dark:text-text-dark-primary">PAN Validation</h4>
              <p className="text-xs text-text-muted mt-1">Format: ABCDE1234F. Checks if PAN already exists in system.</p>
            </div>

            <div className="relative pl-6">
              <div className="absolute left-0 top-1.5 w-2.5 h-2.5 rounded-full bg-info"></div>
              <h4 className="font-bold text-sm text-text-primary dark:text-text-dark-primary">Pincode Validation</h4>
              <p className="text-xs text-text-muted mt-1">Must be a valid 6-digit pincode.</p>
            </div>

          </div>
        </Card>

      </div>
    </div>
  );
}
