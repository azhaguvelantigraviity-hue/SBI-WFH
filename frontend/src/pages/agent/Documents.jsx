import React, { useState } from 'react';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../context/ToastContext';
import { FileText, CheckCircle2, UploadCloud, AlertCircle } from 'lucide-react';
import { cn } from '../../utils/cn';

export function DocumentsPage() {
  const { addToast } = useToast();
  
  const [documents, setDocuments] = useState({
    aadhar: { name: 'Aadhar Card', status: 'verified', file: 'aadhar_front.pdf' },
    pan: { name: 'PAN Card', status: 'verified', file: 'pan_card.pdf' },
    bank: { name: 'Bank Cancelled Cheque', status: 'pending', file: null },
  });

  const [uploading, setUploading] = useState(false);

  const handleFileChange = (docKey, e) => {
    const file = e.target.files[0];
    if (file) {
      setUploading(true);
      
      // Simulate file upload
      setTimeout(() => {
        setDocuments(prev => ({
          ...prev,
          [docKey]: {
            ...prev[docKey],
            status: 'uploaded',
            file: file.name
          }
        }));
        setUploading(false);
        addToast('success', 'Document Uploaded', `${file.name} uploaded successfully.`);
      }, 1500);
    }
  };

  const docList = Object.entries(documents);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      <SectionHeader
        title="My Documents"
        subtitle="Manage your personal KYC and banking documents"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Document Status Summary */}
        <div className="md:col-span-1 space-y-6">
          <Card className="p-6">
            <h3 className="font-bold text-lg mb-4">KYC Status</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-muted">Profile Completion</span>
                <span className="text-sm font-bold text-success">66%</span>
              </div>
              <div className="w-full bg-background-dark/10 rounded-full h-2">
                <div className="bg-success h-2 rounded-full w-2/3"></div>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <CheckCircle2 className="w-4 h-4 text-success" />
                <span className="text-text-primary dark:text-text-dark-primary">Identity Verified</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <AlertCircle className="w-4 h-4 text-warning" />
                <span className="text-text-primary dark:text-text-dark-primary">Bank Details Pending</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Document Upload Grid */}
        <div className="md:col-span-2 space-y-6">
          <Card title="Required Documents">
            <div className="mt-4 space-y-4">
              {docList.map(([key, doc]) => {
                const isVerified = doc.status === 'verified';
                const isUploaded = doc.status === 'uploaded';
                const isReview = doc.status === 'under_review';
                const isGreen = isVerified || isUploaded;
                
                return (
                  <div key={key} className={cn(
                    "flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border transition-all duration-500",
                    isGreen ? "border-success/40 bg-success/10" :
                    isReview ? "border-warning/30 bg-warning/5" :
                    "border-border-light dark:border-border-dark bg-background-dark/5 dark:bg-background/5"
                  )}>
                    <div className="flex items-center gap-4 mb-4 sm:mb-0">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-500",
                        isGreen ? "bg-success/20 text-success" :
                        isReview ? "bg-warning/20 text-warning" :
                        "bg-background-dark/20 text-text-muted"
                      )}>
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm">{doc.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={cn(
                            "text-[10px] font-bold uppercase tracking-wider",
                            isGreen ? "text-success" :
                            isReview ? "text-warning" : "text-danger"
                          )}>
                            {isUploaded ? 'Uploaded ✓' : doc.status.replace('_', ' ')}
                          </span>
                          {doc.file && (
                            <>
                              <span className="text-text-muted text-[10px]">•</span>
                              <span className="text-text-muted text-xs truncate max-w-[150px]">{doc.file}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="relative">
                      {isGreen ? (
                        <Button variant="ghost" disabled className="text-success border-success/30 opacity-100">
                          {isUploaded ? 'Uploaded ✓' : 'Verified ✓'}
                        </Button>
                      ) : isReview ? (
                        <Button variant="ghost" disabled className="text-warning border-warning/30 opacity-100">
                          In Review
                        </Button>
                      ) : (
                        <div>
                          <input 
                            type="file" 
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={(e) => handleFileChange(key, e)}
                            disabled={uploading}
                            accept=".pdf,.jpg,.jpeg,.png"
                          />
                          <Button icon={UploadCloud} disabled={uploading}>
                            {uploading ? 'Uploading...' : 'Upload File'}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-text-muted mt-6 text-center">
              All documents must be clear and readable. Accepted formats: PDF, JPG, PNG (Max 5MB).
            </p>
          </Card>
        </div>

      </div>
    </div>
  );
}
