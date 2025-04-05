
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useMultiStageForm } from "@/hooks/useMultiStageForm";
import { SyncStatus } from "../workflow/SyncStatus";
import { TaskMonitorCard } from "../task/TaskMonitorCard";
import { ErrorBoundaryWithRetry } from "../error/ErrorBoundaryWithRetry";
import { Upload } from "lucide-react";

interface DocumentUploadStageProps {
  subStage: string;
}

export function DocumentUploadStage({ subStage }: DocumentUploadStageProps) {
  const { updateField, formData, nextSubStage, prevSubStage, syncStatus } = useMultiStageForm('app-1');
  const [uploadedDocs, setUploadedDocs] = useState<string[]>(formData.uploadedDocs || []);

  const handleUpload = (documentType: string) => {
    // In a real app, this would trigger a file upload
    const newDocs = [...uploadedDocs];
    if (!newDocs.includes(documentType)) {
      newDocs.push(documentType);
      setUploadedDocs(newDocs);
      updateField('uploadedDocs', newDocs);
    }
  };

  const requiredDocuments = [
    { id: 'id_proof', title: 'Identity Proof', description: 'Passport, Driver\'s License, or National ID' },
    { id: 'address_proof', title: 'Address Proof', description: 'Utility Bill or Bank Statement' },
    { id: 'income_proof', title: 'Income Proof', description: 'Pay Slips or Tax Returns' },
  ];

  if (subStage === 'upload') {
    return (
      <div className="form-section space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="form-heading">Document Upload</h2>
          <SyncStatus status={syncStatus} />
        </div>
        
        <p className="text-sm text-muted-foreground mb-4">
          Please upload the following documents to continue with your application.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {requiredDocuments.map(doc => (
            <Card key={doc.id} className={`p-4 ${uploadedDocs.includes(doc.id) ? 'bg-primary-50 border-primary-200' : ''}`}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{doc.title}</h3>
                  <p className="text-sm text-muted-foreground">{doc.description}</p>
                </div>
                
                {uploadedDocs.includes(doc.id) ? (
                  <div className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">
                    Uploaded
                  </div>
                ) : (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleUpload(doc.id)}
                  >
                    <Upload className="h-4 w-4 mr-1" />
                    Upload
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
        
        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={prevSubStage}>
            Back
          </Button>
          <Button 
            onClick={nextSubStage}
            disabled={uploadedDocs.length < requiredDocuments.length}
          >
            Continue
          </Button>
        </div>
      </div>
    );
  }

  if (subStage === 'verification') {
    return (
      <div className="form-section space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="form-heading">Document Verification</h2>
          <SyncStatus status={syncStatus} />
        </div>
        
        <Card className="p-4 mb-4">
          <p className="text-sm">
            Our system is now verifying your uploaded documents. This process usually takes a few minutes.
          </p>
        </Card>
        
        <ErrorBoundaryWithRetry>
          <TaskMonitorCard 
            taskName="documentVerification"
            title="Document Verification"
            description="We're verifying the documents you uploaded."
            applicationId="app-1"
          />
        </ErrorBoundaryWithRetry>
        
        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={prevSubStage}>
            Back
          </Button>
          <Button onClick={nextSubStage}>
            Continue
          </Button>
        </div>
      </div>
    );
  }

  if (subStage === 'auto-offer') {
    return (
      <div className="form-section space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="form-heading">Auto Loan Offer</h2>
          <SyncStatus status={syncStatus} />
        </div>
        
        <Card className="p-4 mb-4">
          <p className="text-sm">
            Based on your application details and credit score, our system will generate a personalized loan offer for you.
          </p>
        </Card>
        
        <ErrorBoundaryWithRetry>
          <TaskMonitorCard 
            taskName="autoOffer"
            title="Auto Loan Offer Generation"
            description="We're creating a personalized loan offer based on your profile."
            applicationId="app-1"
          />
        </ErrorBoundaryWithRetry>
        
        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={prevSubStage}>
            Back
          </Button>
          <Button onClick={nextSubStage}>
            Continue to Underwriting
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
