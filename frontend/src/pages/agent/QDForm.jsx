import React, { useState, useEffect } from 'react';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { leadsApi } from '../../api/leadsApi';
import { qdApi } from '../../api/qdApi';
import { useToast } from '../../context/ToastContext';
import { Check, UploadCloud, FileText, Landmark } from 'lucide-react';
import { cn } from '../../utils/cn';

const STEPS = [
  { id: 1, label: 'Basic Info' },
  { id: 2, label: 'Employment' },
  { id: 3, label: 'Documents' },
  { id: 4, label: 'Review' },
];

export function QDFormPage() {
  const [leads, setLeads] = useState([]);
  const [selectedLeadId, setSelectedLeadId] = useState('');
  const [loadingLeads, setLoadingLeads] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { addToast } = useToast();

  const [step, setStep] = useState(1);
  
  const [form, setForm] = useState({
    father_name: '',
    mother_name: '',
    address: '',
    employment_type: '',
    designation: '',
    monthly_salary: '',
    employer_name: '',
    employer_address: '',
    business_name: '',
    gst_number: '',
    business_nature: '',
  });

  const [docs, setDocs] = useState({
    payslips: null,
    bank_statement: null,
    shop_photo: null
  });

  useEffect(() => {
    const fetchEligibleLeads = async () => {
      try {
        const res = await leadsApi.getLeads({ limit: 100 });
        if (res.success) {
          const eligible = res.data.filter(l => l.status === 'eligible');
          setLeads(eligible);
        }
      } catch (err) {
        addToast('error', 'Error', 'Failed to load eligible leads.');
      } finally {
        setLoadingLeads(false);
      }
    };
    fetchEligibleLeads();
  }, []);

  const activeLead = leads.find(l => l._id === selectedLeadId);

  const handleNext = () => {
    if (step === 1 && (!form.address)) {
      return addToast('warning', 'Required', 'Please fill the address field.');
    }
    if (step === 2 && !form.employment_type) {
      return addToast('warning', 'Required', 'Please select employment type.');
    }
    setStep(p => Math.min(p + 1, 4));
  };

  const handleBack = () => setStep(p => Math.max(p - 1, 1));

  const handleFileChange = (e, type) => {
    if (e.target.files && e.target.files[0]) {
      setDocs(prev => ({ ...prev, [type]: e.target.files[0] }));
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // 1. Submit QD Data
      let extraNotes = '';
      if (form.employment_type === 'self_employed') {
        extraNotes = ` | Biz: ${form.business_name} | GST: ${form.gst_number || 'N/A'} | Nature: ${form.business_nature}`;
      }

      const qdPayload = {
        lead_id: activeLead._id,
        employment_type: form.employment_type,
        monthly_income: parseInt(form.monthly_salary) || 0,
        annual_income: (parseInt(form.monthly_salary) || 0) * 12,
        employer_name: form.employer_name || form.business_name,
        notes: `Address: ${form.address} | Father: ${form.father_name} | Mother: ${form.mother_name} | Role: ${form.designation} | Office: ${form.employer_address}${extraNotes}`,
      };

      const qdRes = await qdApi.submitQD(qdPayload);
      
      if (qdRes.success) {
        const qdId = qdRes.data.id || qdRes.data._id; // depending on backend return format
        
        // 2. Upload Documents if any exist
        if (docs.payslips || docs.bank_statement || docs.shop_photo) {
          const formData = new FormData();
          if (docs.payslips) formData.append('documents', docs.payslips);
          if (docs.bank_statement) formData.append('documents', docs.bank_statement);
          if (docs.shop_photo) formData.append('documents', docs.shop_photo);

          try {
            await qdApi.uploadDocs(qdId, formData);
          } catch (docErr) {
            addToast('warning', 'Partial Success', 'QD submitted but documents failed to upload.');
          }
        }

        addToast('success', 'QD Submitted', 'Quality data successfully sent to admin.');
        
        // Reset form
        setSelectedLeadId('');
        setStep(1);
        setForm({
          father_name: '', mother_name: '', address: '', 
          employment_type: '', designation: '', monthly_salary: '', 
          employer_name: '', employer_address: '',
          business_name: '', gst_number: '', business_nature: ''
        });
        setDocs({ payslips: null, bank_statement: null, shop_photo: null });
        setLeads(leads.filter(l => l._id !== activeLead._id));
      }
    } catch (err) {
      addToast('error', 'Submission Failed', err.response?.data?.message || 'Could not submit QD form.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!selectedLeadId) {
    return (
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-4xl mx-auto py-10">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-bold uppercase tracking-widest">
            <Check className="w-3 h-3" />
            Stage: Quality Data Collection
          </div>
          <h1 className="text-3xl font-fraunces font-bold text-text-primary dark:text-text-dark-primary">
            Quality Data (QD) Form
          </h1>
          <p className="text-sm text-text-muted max-w-md mx-auto">
            Please select an eligible lead from the list below to begin collecting detailed customer information and documents.
          </p>
        </div>

        <Card className="p-10 border-none shadow-2xl shadow-accent/5 bg-gradient-to-br from-background-light to-background-dark/5 dark:from-background-dark dark:to-background-dark/20 relative overflow-hidden group">
          {/* Decorative element */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-accent/5 rounded-full blur-3xl group-hover:bg-accent/10 transition-colors duration-500"></div>
          
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-accent to-purple-600 text-white flex items-center justify-center shadow-xl shadow-accent/30 mb-8 transform group-hover:scale-105 transition-transform duration-500">
              <FileText className="w-10 h-10" />
            </div>
            
            <div className="w-full max-w-md space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-text-muted uppercase tracking-[0.15em]">Select Eligible Lead</label>
                {loadingLeads ? (
                  <div className="flex items-center justify-center p-4">
                    <div className="w-6 h-6 border-3 border-accent border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <Select 
                    value={selectedLeadId}
                    onChange={(e) => setSelectedLeadId(e.target.value)}
                    options={[
                      { value: '', label: '— Choose a customer to start —' },
                      ...leads.map(l => ({ value: l._id, label: `${l.customer_name} • ${l.lead_number}` }))
                    ]}
                    selectClassName="w-full text-left h-14 text-base font-bold rounded-2xl border-border-light dark:border-border-dark bg-white dark:bg-background-dark shadow-sm focus:ring-4 focus:ring-accent/10"
                  />
                )}
              </div>

              {leads.length === 0 && !loadingLeads ? (
                <div className="p-4 rounded-2xl bg-warning/5 border border-warning/20 flex items-start gap-3 text-left">
                  <div className="w-5 h-5 rounded-full bg-warning/20 text-warning flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[10px] font-bold">!</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-text-primary dark:text-text-dark-primary">No eligible leads found</p>
                    <p className="text-[10px] text-text-muted mt-0.5">You must first complete the PAN and Pincode verification stage for your assigned leads.</p>
                  </div>
                </div>
              ) : !loadingLeads && (
                <div className="flex items-center justify-center gap-2 py-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-success"></div>
                  <span className="text-[10px] font-bold text-success uppercase tracking-wider">
                    {leads.length} Eligible leads available
                  </span>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Basic Info', desc: 'Collect family details and full address' },
            { label: 'Employment', desc: 'Job role, income and employer details' },
            { label: 'Documents', desc: 'Upload payslips and bank statements' },
          ].map((item, i) => (
            <div key={i} className="p-6 rounded-3xl bg-background-dark/5 dark:bg-background/5 border border-border-light dark:border-border-dark text-center space-y-2">
              <span className="text-[10px] font-bold text-accent uppercase tracking-widest">Step 0{i+1}</span>
              <h4 className="font-bold text-sm text-text-primary dark:text-text-dark-primary">{item.label}</h4>
              <p className="text-[10px] text-text-muted leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      <SectionHeader
        title="QD Form — Quality Data"
        subtitle={`Collecting data for ${activeLead?.customer_name}`}
      />

      {/* Stepper */}
      <div className="flex items-center justify-between mb-8 px-4">
        {STEPS.map((s, i) => {
          const isCompleted = step > s.id;
          const isActive = step === s.id;
          return (
            <React.Fragment key={s.id}>
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors shadow-sm",
                  isCompleted ? "bg-success text-white" : isActive ? "bg-accent text-white" : "bg-background-dark/20 text-text-muted"
                )}>
                  {isCompleted ? <Check className="w-4 h-4" /> : s.id}
                </div>
                <span className={cn(
                  "text-sm hidden sm:block",
                  isCompleted || isActive ? "text-text-primary font-bold dark:text-text-dark-primary" : "text-text-muted"
                )}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={cn(
                  "h-[2px] flex-1 mx-4 transition-colors",
                  isCompleted ? "bg-success" : "bg-border-light dark:bg-border-dark"
                )}></div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Step Content */}
      <Card>
        
        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <h3 className="font-bold text-lg border-b border-border-light dark:border-border-dark pb-3">Step 1: Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Customer Name" value={activeLead.customer_name} disabled />
              <Input label="Mobile" value={activeLead.mobile} disabled />
              <Input 
                label="Father's Name" 
                placeholder="Enter father's name"
                value={form.father_name}
                onChange={e => setForm({...form, father_name: e.target.value})}
              />
              <Input 
                label="Mother's Name" 
                placeholder="Enter mother's name"
                value={form.mother_name}
                onChange={e => setForm({...form, mother_name: e.target.value})}
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Residential Address</label>
              <textarea 
                placeholder="Full address"
                value={form.address}
                onChange={e => setForm({...form, address: e.target.value})}
                className="w-full bg-background-dark/5 dark:bg-background/5 border border-border-light dark:border-border-dark rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent min-h-[100px] resize-none"
              />
            </div>
          </div>
        )}

        {/* Step 2: Employment */}
        {step === 2 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <h3 className="font-bold text-lg border-b border-border-light dark:border-border-dark pb-3">Step 2: Employment Details</h3>
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Employment Type</label>
              <Select 
                value={form.employment_type}
                onChange={(e) => setForm({...form, employment_type: e.target.value})}
                options={[
                  { value: '', label: '— Select Type —' },
                  { value: 'salaried', label: 'Salaried' },
                  { value: 'self_employed', label: 'Self Employed' },
                  { value: 'business', label: 'Business Owner' },
                ]}
                className="w-full border-accent/50" // Highlighting to match screenshot design
              />
            </div>

            {form.employment_type === 'salaried' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in">
                <Input 
                  label="Job Role / Designation" 
                  placeholder="e.g. Software Engineer"
                  value={form.designation}
                  onChange={e => setForm({...form, designation: e.target.value})}
                />
                <Input 
                  label="Monthly Salary (₹)" 
                  type="number"
                  placeholder="e.g. 45000"
                  value={form.monthly_salary}
                  onChange={e => setForm({...form, monthly_salary: e.target.value})}
                />
                <div className="md:col-span-2">
                  <Input 
                    label="Company Name" 
                    placeholder="Employer name"
                    value={form.employer_name}
                    onChange={e => setForm({...form, employer_name: e.target.value})}
                  />
                </div>
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Company Address</label>
                  <textarea 
                    placeholder="Office address"
                    value={form.employer_address}
                    onChange={e => setForm({...form, employer_address: e.target.value})}
                    className="w-full bg-background-dark/5 dark:bg-background/5 border border-border-light dark:border-border-dark rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent min-h-[80px] resize-none"
                  />
                </div>
              </div>
            )}

            {form.employment_type === 'self_employed' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in">
                <Input 
                  label="Business Name" 
                  placeholder="Company / shop name"
                  value={form.business_name}
                  onChange={e => setForm({...form, business_name: e.target.value})}
                />
                <Input 
                  label="GST Number (Optional)" 
                  placeholder="22AAAAA0000A1Z5"
                  value={form.gst_number}
                  onChange={e => setForm({...form, gst_number: e.target.value})}
                />
                <div className="md:col-span-2">
                  <Input 
                    label="Business Source / Nature" 
                    placeholder="e.g. Retail, Trading, Services"
                    value={form.business_nature}
                    onChange={e => setForm({...form, business_nature: e.target.value})}
                  />
                </div>
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Shop/Company Address</label>
                  <textarea 
                    placeholder="Business address"
                    value={form.employer_address} // Reusing employer_address for business address
                    onChange={e => setForm({...form, employer_address: e.target.value})}
                    className="w-full bg-background-dark/5 dark:bg-background/5 border border-border-light dark:border-border-dark rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent min-h-[80px] resize-none"
                  />
                </div>
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Shop Board Photo</label>
                  <div className="border-2 border-dashed border-border-light dark:border-border-dark bg-background-dark/5 dark:bg-background/5 rounded-2xl p-8 flex flex-col items-center justify-center relative hover:border-accent/50 transition-colors">
                    <input 
                      type="file" 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={(e) => handleFileChange(e, 'shop_photo')}
                      accept=".jpg,.jpeg,.png"
                    />
                    <FileText className="w-8 h-8 text-text-muted mb-2" />
                    <p className="text-sm font-bold text-accent">
                      {docs.shop_photo ? docs.shop_photo.name : 'Upload shop board photo'}
                    </p>
                    <p className="text-xs text-text-muted mt-1">PNG, JPG max 5MB</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Documents */}
        {step === 3 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <h3 className="font-bold text-lg border-b border-border-light dark:border-border-dark pb-3">Step 3: Document Upload</h3>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">3 Month Payslips</label>
                <div className="border-2 border-dashed border-border-light dark:border-border-dark bg-background-dark/5 dark:bg-background/5 rounded-2xl p-8 flex flex-col items-center justify-center relative hover:border-accent/50 transition-colors">
                  <input 
                    type="file" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={(e) => handleFileChange(e, 'payslips')}
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  <FileText className="w-8 h-8 text-text-muted mb-2" />
                  <p className="text-sm font-bold text-accent">
                    {docs.payslips ? docs.payslips.name : 'Upload 3 latest payslips'}
                  </p>
                  <p className="text-xs text-text-muted mt-1">PDF, JPG, PNG</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Bank Statement (3 Months)</label>
                <div className="border-2 border-dashed border-purple-500/50 bg-purple-500/5 rounded-2xl p-8 flex flex-col items-center justify-center relative hover:border-purple-500 transition-colors">
                  <input 
                    type="file" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={(e) => handleFileChange(e, 'bank_statement')}
                    accept=".pdf"
                  />
                  <Landmark className="w-8 h-8 text-text-muted mb-2" />
                  <p className="text-sm font-bold text-purple-500">
                    {docs.bank_statement ? docs.bank_statement.name : 'Upload bank statement'}
                  </p>
                  <p className="text-xs text-text-muted mt-1">PDF only</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <h3 className="font-bold text-lg border-b border-border-light dark:border-border-dark pb-3">Step 4: Review & Submit</h3>
            
            <div className="space-y-4 border border-border-light dark:border-border-dark rounded-xl p-1 bg-background-dark/5 dark:bg-background/5">
              <div className="grid grid-cols-4 p-3 border-b border-border-light dark:border-border-dark last:border-0">
                <span className="text-xs font-bold text-text-muted uppercase col-span-1">Customer</span>
                <span className="font-bold text-sm col-span-3">{activeLead.customer_name}</span>
              </div>
              <div className="grid grid-cols-4 p-3 border-b border-border-light dark:border-border-dark last:border-0">
                <span className="text-xs font-bold text-text-muted uppercase col-span-1">Mobile</span>
                <span className="font-mono text-sm col-span-3">{activeLead.mobile}</span>
              </div>
              <div className="grid grid-cols-4 p-3 border-b border-border-light dark:border-border-dark last:border-0">
                <span className="text-xs font-bold text-text-muted uppercase col-span-1">Employment</span>
                <span className="font-medium text-sm capitalize col-span-3">{form.employment_type.replace('_', ' ')}</span>
              </div>
              <div className="grid grid-cols-4 p-3 border-b border-border-light dark:border-border-dark last:border-0">
                <span className="text-xs font-bold text-text-muted uppercase col-span-1">Documents</span>
                <span className="font-medium text-sm col-span-3 flex items-center text-success">
                  <Check className="w-4 h-4 mr-1" />
                  {((docs.payslips ? 1 : 0) + (docs.bank_statement ? 1 : 0))} uploaded
                </span>
              </div>
            </div>

            <div className="bg-success/10 border border-success/20 rounded-xl p-4 flex items-center text-success text-sm font-bold">
              <Check className="w-5 h-5 mr-2" />
              All fields verified. Ready to submit.
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-border-light dark:border-border-dark">
          {step > 1 && (
            <Button variant="ghost" onClick={handleBack} disabled={submitting}>← Back</Button>
          )}
          {step < 4 ? (
            <Button onClick={handleNext} className="px-8">Next →</Button>
          ) : (
            <Button onClick={handleSubmit} disabled={submitting} className="px-8">
              {submitting ? 'Submitting...' : 'Submit QD Form ✓'}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
