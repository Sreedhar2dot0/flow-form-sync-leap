
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMultiStageForm } from "@/hooks/useMultiStageForm";
import { SyncStatus } from "../workflow/SyncStatus";
import { Check, Download, FileCheck, Upload } from "lucide-react";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ApprovalStageProps {
  subStage: string;
}

export function ApprovalStage({ subStage }: ApprovalStageProps) {
  const { updateField, formData, nextSubStage, prevSubStage, syncStatus } = useMultiStageForm('app-1');
  const [agreementAccepted, setAgreementAccepted] = useState(formData.agreementAccepted || false);
  const [disbursementInitiated, setDisbursementInitiated] = useState(false);

  const handleChecklistChange = (item: string) => {
    const currentChecklist = {...(formData.finalChecklist || {})};
    currentChecklist[item] = !currentChecklist[item];
    updateField('finalChecklist', currentChecklist);
  };

  const allChecklistItemsComplete = () => {
    const checklist = formData.finalChecklist || {};
    const requiredItems = ['agreementSigned', 'bankVerified', 'kycComplete', 'termsAccepted'];
    
    return requiredItems.every(item => checklist[item]);
  };

  const handleAcceptAgreement = () => {
    setAgreementAccepted(true);
    updateField('agreementAccepted', true);
    updateField('agreementSignedDate', new Date().toISOString());
  };

  const loanDetails = {
    amount: formData.loanAmount || 25000,
    term: '48 months',
    rate: '7.5%',
    emi: 602.05,
    disbursementDate: new Date().toLocaleDateString(),
    accountNumber: 'XXXX1234',
  };

  if (subStage === 'sanction') {
    return (
      <div className="form-section space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="form-heading">Sanction & Agreement</h2>
          <SyncStatus status={syncStatus} />
        </div>
        
        <Card className="mb-6">
          <CardHeader className="bg-primary-50 border-b">
            <CardTitle className="text-primary-800">Your Loan Offer</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Loan Amount:</span>
                  <span className="text-sm">${Number(loanDetails.amount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Interest Rate:</span>
                  <span className="text-sm">{loanDetails.rate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Term:</span>
                  <span className="text-sm">{loanDetails.term}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Monthly Payment:</span>
                  <span className="text-sm">${loanDetails.emi}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Total Repayment:</span>
                  <span className="text-sm">${(loanDetails.emi * 48).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">First Payment Date:</span>
                  <span className="text-sm">30 days after disbursement</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="bg-gray-50 border-b">
            <div className="flex justify-between items-center">
              <CardTitle className="text-gray-700 text-lg">Loan Agreement</CardTitle>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="mb-4">
              <p className="mb-2">
                By accepting this agreement, you confirm that:
              </p>
              <ul className="list-disc pl-5 space-y-1 mb-4">
                <li>You have reviewed all loan terms and conditions</li>
                <li>The information provided in your application is accurate</li>
                <li>You understand the repayment schedule and obligations</li>
                <li>You agree to the interest rate and fees associated with this loan</li>
              </ul>
            </div>
            
            {agreementAccepted ? (
              <div className="flex items-center p-3 bg-green-50 border border-green-100 rounded-lg text-green-700">
                <Check className="h-5 w-5 mr-2 text-green-600" />
                Agreement accepted on {new Date().toLocaleDateString()}
              </div>
            ) : (
              <Button onClick={handleAcceptAgreement} className="w-full mt-2">
                <FileCheck className="h-4 w-4 mr-2" />
                I Accept the Agreement
              </Button>
            )}
          </CardContent>
        </Card>
        
        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={prevSubStage}>
            Back
          </Button>
          <Button 
            onClick={nextSubStage}
            disabled={!agreementAccepted}
          >
            Continue to Disbursement
          </Button>
        </div>
      </div>
    );
  }

  if (subStage === 'disbursement') {
    return (
      <div className="form-section space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="form-heading">Final Checklist & Disbursement</h2>
          <SyncStatus status={syncStatus} />
        </div>
        
        <Card>
          <CardHeader className="bg-gray-50 border-b">
            <CardTitle className="text-gray-700">Pre-Disbursement Checklist</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <input 
                  type="checkbox" 
                  id="agreementSigned" 
                  checked={(formData.finalChecklist?.agreementSigned || false)} 
                  onChange={() => handleChecklistChange('agreementSigned')}
                />
                <label htmlFor="agreementSigned" className="text-sm">
                  Loan agreement has been signed
                </label>
              </div>
              
              <div className="flex items-center space-x-3">
                <input 
                  type="checkbox" 
                  id="bankVerified" 
                  checked={(formData.finalChecklist?.bankVerified || false)} 
                  onChange={() => handleChecklistChange('bankVerified')}
                />
                <label htmlFor="bankVerified" className="text-sm">
                  Bank account details have been verified
                </label>
              </div>
              
              <div className="flex items-center space-x-3">
                <input 
                  type="checkbox" 
                  id="kycComplete" 
                  checked={(formData.finalChecklist?.kycComplete || false)} 
                  onChange={() => handleChecklistChange('kycComplete')}
                />
                <label htmlFor="kycComplete" className="text-sm">
                  KYC verification completed
                </label>
              </div>
              
              <div className="flex items-center space-x-3">
                <input 
                  type="checkbox" 
                  id="termsAccepted" 
                  checked={(formData.finalChecklist?.termsAccepted || false)} 
                  onChange={() => handleChecklistChange('termsAccepted')}
                />
                <label htmlFor="termsAccepted" className="text-sm">
                  Customer has accepted all terms and conditions
                </label>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="bg-primary-50 border-b">
            <CardTitle className="text-primary-800">Disbursement Details</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Amount:</span>
                    <span className="text-sm">${Number(loanDetails.amount).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Account Number:</span>
                    <span className="text-sm">{loanDetails.accountNumber}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Disbursement Date:</span>
                    <span className="text-sm">{loanDetails.disbursementDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Processing Fee:</span>
                    <span className="text-sm">${(Number(loanDetails.amount) * 0.01).toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <Label htmlFor="disbursementNotes">Notes (Optional)</Label>
                <Textarea 
                  id="disbursementNotes" 
                  name="disbursementNotes"
                  value={formData.disbursementNotes || ''}
                  onChange={(e) => updateField('disbursementNotes', e.target.value)}
                  placeholder="Any additional notes for disbursement..."
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {!disbursementInitiated ? (
          <Button 
            onClick={() => setDisbursementInitiated(true)}
            className="w-full"
            disabled={!allChecklistItemsComplete()}
          >
            <Upload className="h-4 w-4 mr-2" />
            Initiate Disbursement
          </Button>
        ) : (
          <div className="p-4 bg-success-50 border border-success-100 rounded-lg text-success-500 flex items-center justify-center">
            <Check className="h-5 w-5 mr-2" />
            <span className="font-medium">Disbursement successfully initiated!</span>
          </div>
        )}
        
        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={prevSubStage}>
            Back
          </Button>
          <Button onClick={() => console.log('Application complete')}>
            Complete Application
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
