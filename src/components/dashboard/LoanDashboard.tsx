
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useGlobalState } from '@/context/GlobalContext';
import { ProgressBar } from '../workflow/ProgressBar';
import { NetworkStatusIndicator } from '../network/NetworkStatusIndicator';
import { LeadCaptureStage } from '../forms/LeadCaptureStage';
import { ApplicationStage } from '../forms/ApplicationStage';
import { DocumentUploadStage } from '../forms/DocumentUploadStage';
import { UnderwritingStage } from '../forms/UnderwritingStage';
import { ApprovalStage } from '../forms/ApprovalStage';
import { Calendar, CreditCard, FileText, BarChart2 } from 'lucide-react';

export function LoanDashboard() {
  const { state } = useGlobalState();
  const { currentStage, currentSubStageId } = state.workflow;
  const [activeTab, setActiveTab] = useState('workflow');
  
  const selectedApplication = state.applications.find(app => 
    app.id === state.selectedApplicationId
  ) || null;

  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-2">Loan Application Dashboard</h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Badge className="bg-primary-600 hover:bg-primary-700">
                {selectedApplication?.loanType || 'Personal'} Loan
              </Badge>
              <span className="text-sm text-muted-foreground ml-2">
                ${selectedApplication?.amount.toLocaleString() || '0'}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge 
                variant="outline" 
                className={`${
                  selectedApplication?.status === 'Approved' ? 'border-success-500 text-success-500' :
                  selectedApplication?.status === 'Rejected' ? 'border-destructive text-destructive' :
                  'border-primary text-primary'
                }`}
              >
                {selectedApplication?.status || 'In Progress'}
              </Badge>
              <NetworkStatusIndicator />
            </div>
          </div>
        </div>
        
        <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
          <button 
            onClick={() => setActiveTab('workflow')}
            className={`px-3 py-1.5 text-sm rounded-md transition ${
              activeTab === 'workflow' 
                ? 'bg-primary text-white' 
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            Application
          </button>
          <button 
            onClick={() => setActiveTab('documents')}
            className={`px-3 py-1.5 text-sm rounded-md transition ${
              activeTab === 'documents' 
                ? 'bg-primary text-white' 
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            Documents
          </button>
          <button 
            onClick={() => setActiveTab('payments')}
            className={`px-3 py-1.5 text-sm rounded-md transition ${
              activeTab === 'payments' 
                ? 'bg-primary text-white' 
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            Payments
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 text-sm rounded-md transition ${
              activeTab === 'history' 
                ? 'bg-primary text-white' 
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            History
          </button>
        </div>
      </div>

      {activeTab === 'workflow' ? (
        <>
          <ProgressBar className="sticky top-0 z-10" />
          
          <div className="space-y-6">
            {currentStage === 'lead-capture' && (
              <LeadCaptureStage subStage={currentSubStageId} />
            )}
            
            {currentStage === 'application' && (
              <ApplicationStage subStage={currentSubStageId} />
            )}
            
            {currentStage === 'document-upload' && (
              <DocumentUploadStage subStage={currentSubStageId} />
            )}
            
            {currentStage === 'underwriting' && (
              <UnderwritingStage subStage={currentSubStageId} />
            )}
            
            {currentStage === 'approval' && (
              <ApprovalStage subStage={currentSubStageId} />
            )}
          </div>
        </>
      ) : activeTab === 'documents' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="bg-gray-50 border-b">
              <CardTitle className="text-base flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Application Documents
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <p className="text-muted-foreground text-sm mb-4">
                View and manage application documents
              </p>
              <div className="space-y-2">
                {['ID Proof', 'Address Proof', 'Income Statement', 'Bank Statements'].map((doc) => (
                  <div key={doc} className="p-2 border rounded-md text-sm flex justify-between items-center">
                    <span>{doc}</span>
                    <Badge variant="outline">Uploaded</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="bg-gray-50 border-b">
              <CardTitle className="text-base flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Loan Agreement
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <p className="text-muted-foreground text-sm mb-4">
                View and download loan agreement
              </p>
              <div className="p-3 border rounded-md text-sm flex justify-between items-center">
                <span>Loan Agreement.pdf</span>
                <Badge>Signed</Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="bg-gray-50 border-b">
              <CardTitle className="text-base flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Other Documents
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <p className="text-muted-foreground text-sm mb-4">
                Additional supporting documents
              </p>
              <div className="p-3 border rounded-md text-sm flex justify-between items-center">
                <span>No additional documents</span>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : activeTab === 'payments' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="bg-gray-50 border-b">
              <CardTitle className="text-base flex items-center">
                <CreditCard className="h-4 w-4 mr-2" />
                Payment Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <p className="text-muted-foreground text-sm mb-4">
                Upcoming loan payments
              </p>
              <div className="space-y-2">
                {['May 1, 2025', 'Jun 1, 2025', 'Jul 1, 2025'].map((date) => (
                  <div key={date} className="p-2 border rounded-md text-sm flex justify-between items-center">
                    <span>{date}</span>
                    <span>$602.05</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="bg-gray-50 border-b">
              <CardTitle className="text-base flex items-center">
                <BarChart2 className="h-4 w-4 mr-2" />
                Payment Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <p className="text-muted-foreground text-sm mb-4">
                How your payment is applied
              </p>
              <div className="space-y-2">
                <div className="p-2 border rounded-md text-sm flex justify-between items-center">
                  <span>Principal</span>
                  <span>$395.39</span>
                </div>
                <div className="p-2 border rounded-md text-sm flex justify-between items-center">
                  <span>Interest</span>
                  <span>$206.66</span>
                </div>
                <div className="p-2 border rounded-md text-sm flex justify-between items-center font-medium">
                  <span>Total Payment</span>
                  <span>$602.05</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="bg-gray-50 border-b">
              <CardTitle className="text-base flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Payment History
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <p className="text-muted-foreground text-sm mb-4">
                Recent payment activity
              </p>
              <div className="p-3 border rounded-md text-sm flex justify-between items-center">
                <span>No payment history available</span>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="bg-gray-50 border-b">
              <CardTitle className="text-base">Application Timeline</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <p className="text-muted-foreground text-sm mb-4">
                Recent activity on your application
              </p>
              <div className="space-y-4 mt-2">
                <div className="border-l-2 border-primary-500 pl-4 pb-6 relative">
                  <div className="h-3 w-3 rounded-full bg-primary-500 absolute -left-[7px] top-0"></div>
                  <p className="text-sm font-medium">Application Started</p>
                  <p className="text-xs text-muted-foreground">Apr 5, 2025 at 9:15 AM</p>
                </div>
                <div className="border-l-2 border-primary-500 pl-4 pb-6 relative">
                  <div className="h-3 w-3 rounded-full bg-primary-500 absolute -left-[7px] top-0"></div>
                  <p className="text-sm font-medium">Documents Uploaded</p>
                  <p className="text-xs text-muted-foreground">Apr 5, 2025 at 9:45 AM</p>
                </div>
                <div className="border-l-2 border-primary-500 pl-4 relative">
                  <div className="h-3 w-3 rounded-full bg-primary-500 absolute -left-[7px] top-0"></div>
                  <p className="text-sm font-medium">Credit Check Completed</p>
                  <p className="text-xs text-muted-foreground">Apr 5, 2025 at 10:30 AM</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="bg-gray-50 border-b">
              <CardTitle className="text-base">Application Notes</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <p className="text-muted-foreground text-sm mb-4">
                Internal notes and communications
              </p>
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-md">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-xs font-medium">System</p>
                    <p className="text-xs text-muted-foreground">Apr 5, 2025 at 10:35 AM</p>
                  </div>
                  <p className="text-sm">Credit check completed with score of 720.</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-md">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-xs font-medium">John Doe (Agent)</p>
                    <p className="text-xs text-muted-foreground">Apr 5, 2025 at 11:20 AM</p>
                  </div>
                  <p className="text-sm">Customer has verified all their information and submitted all required documents.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
