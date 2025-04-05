
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useMultiStageForm } from "@/hooks/useMultiStageForm";
import { SyncStatus } from "../workflow/SyncStatus";
import { useGlobalState } from "@/context/GlobalContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface UnderwritingStageProps {
  subStage: string;
}

export function UnderwritingStage({ subStage }: UnderwritingStageProps) {
  const { state } = useGlobalState();
  const { updateField, formData, nextSubStage, prevSubStage, syncStatus } = useMultiStageForm('app-1');
  const userRole = state.user?.role;
  
  // Mock data for risk assessment
  const riskData = {
    score: 75,
    rules: [
      { name: 'income_to_loan_ratio', result: 'Pass', description: 'Income is sufficient for requested loan amount' },
      { name: 'credit_score_check', result: 'Pass', description: 'Credit score above minimum threshold' },
      { name: 'employment_stability', result: 'Warning', description: 'Less than 2 years in current employment' },
      { name: 'existing_debt_ratio', result: 'Warning', description: 'Existing debt is higher than recommended' },
    ]
  };
  
  // Update form data with risk assessment
  useState(() => {
    if (subStage === 'risk-score' && !formData.riskAssessment) {
      updateField('riskAssessment', riskData);
    }
  });
  
  const isAccessRestricted = subStage === 'overrides' && userRole !== 'Manager' && userRole !== 'Admin';

  if (isAccessRestricted) {
    return (
      <div className="form-section space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Access Restricted</AlertTitle>
          <AlertDescription>
            Only Managers and Admins can access the Underwriter Overrides section.
          </AlertDescription>
        </Alert>
        
        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={prevSubStage}>
            Back
          </Button>
          <Button onClick={nextSubStage}>
            Skip to Approval
          </Button>
        </div>
      </div>
    );
  }

  if (subStage === 'risk-score') {
    return (
      <div className="form-section space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="form-heading">Risk Score & Rules</h2>
          <SyncStatus status={syncStatus} />
        </div>
        
        <Card className="p-6 bg-slate-50">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-4 md:mb-0">
              <h3 className="text-lg font-semibold mb-2">Risk Assessment</h3>
              <p className="text-sm text-muted-foreground">
                Application has been evaluated by our risk assessment system.
              </p>
            </div>
            
            <div className="flex items-center">
              <div className="rounded-full h-20 w-20 flex items-center justify-center border-4 border-primary-600 text-primary-800 font-bold text-xl">
                {riskData.score}%
              </div>
              
              <div className="ml-4">
                <div className={`text-sm font-medium ${riskData.score >= 70 ? 'text-success-500' : 'text-warning-500'}`}>
                  {riskData.score >= 70 ? 'Acceptable Risk' : 'Moderate Risk'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Overall assessment
                </p>
              </div>
            </div>
          </div>
        </Card>
        
        <div className="space-y-4">
          <h3 className="text-md font-medium">Rule Results</h3>
          
          <div className="space-y-2">
            {riskData.rules.map((rule, index) => (
              <Card key={index} className={`p-3 ${
                rule.result === 'Pass' ? 'bg-green-50 border-green-100' : 
                rule.result === 'Warning' ? 'bg-amber-50 border-amber-100' : 
                'bg-red-50 border-red-100'
              }`}>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium text-sm">{rule.name.replace(/_/g, ' ')}</div>
                    <p className="text-xs text-muted-foreground">{rule.description}</p>
                  </div>
                  <div className={`px-2 py-1 text-xs rounded ${
                    rule.result === 'Pass' ? 'bg-green-100 text-green-700' : 
                    rule.result === 'Warning' ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {rule.result}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
        
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

  if (subStage === 'overrides') {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      updateField(name, value);
    };
    
    return (
      <div className="form-section space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="form-heading">Underwriter Overrides</h2>
          <SyncStatus status={syncStatus} />
        </div>
        
        <Alert variant="default" className="bg-primary-50 border-primary-100 text-primary-800">
          <div className="flex items-start">
            <div className="mr-2">ℹ️</div>
            <div>
              <AlertTitle>Manager Access</AlertTitle>
              <AlertDescription>
                You are making changes as a Manager. All overrides will be logged for audit purposes.
              </AlertDescription>
            </div>
          </div>
        </Alert>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="riskScoreOverride">Risk Score Override</Label>
            <Input
              id="riskScoreOverride"
              name="riskScoreOverride"
              type="number"
              min="0"
              max="100"
              placeholder="Enter new risk score (0-100)"
              value={formData.riskScoreOverride || ''}
              onChange={handleChange}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Original score: {riskData.score}
            </p>
          </div>
          
          <div>
            <Label htmlFor="overrideReason">Override Reason</Label>
            <Textarea
              id="overrideReason"
              name="overrideReason"
              placeholder="Please provide a detailed reason for the override..."
              value={formData.overrideReason || ''}
              onChange={handleChange}
              className="min-h-[100px]"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="overrideApproval"
              name="overrideApproval"
              checked={formData.overrideApproval || false}
              onChange={(e) => updateField('overrideApproval', e.target.checked)}
            />
            <Label htmlFor="overrideApproval" className="text-sm font-normal">
              I approve these overrides and take responsibility for this decision
            </Label>
          </div>
        </div>
        
        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={prevSubStage}>
            Back
          </Button>
          <Button 
            onClick={nextSubStage}
            disabled={formData.riskScoreOverride && !formData.overrideReason}
          >
            Continue
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
