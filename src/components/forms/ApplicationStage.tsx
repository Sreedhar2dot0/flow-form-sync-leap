
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useMultiStageForm } from "@/hooks/useMultiStageForm";
import { SyncStatus } from "../workflow/SyncStatus";
import { useFieldLogicEngine } from "@/hooks/useFieldLogicEngine";
import { TaskMonitorCard } from "../task/TaskMonitorCard";
import { ErrorBoundaryWithRetry } from "../error/ErrorBoundaryWithRetry";

interface ApplicationStageProps {
  subStage: string;
}

export function ApplicationStage({ subStage }: ApplicationStageProps) {
  const { updateField, formData, nextSubStage, prevSubStage, syncStatus } = useMultiStageForm('app-1');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateField(name, value);
  };

  // Co-applicant visibility configuration
  const coApplicantConfig = {
    name: 'hasCoApplicant',
    visibilityRules: [
      { field: 'loanType', operator: 'equals', value: 'Home' }
    ]
  };
  
  // Income proof visibility configuration
  const incomeProofConfig = {
    name: 'incomeProofType',
    visibilityRules: [
      { field: 'employmentType', operator: 'exists' }
    ],
    enablementRules: [
      { field: 'income', operator: 'greaterThan', value: 0 }
    ]
  };
  
  // Loan amount limit configuration
  const loanAmountConfig = {
    name: 'maxLoanAmount',
    derivedValue: {
      formula: 'income * 0.5',
      dependencies: ['income']
    }
  };

  // Use the field logic engine
  const coApplicant = useFieldLogicEngine(coApplicantConfig, formData);
  const incomeProof = useFieldLogicEngine(incomeProofConfig, formData);
  const loanAmount = useFieldLogicEngine(loanAmountConfig, formData);

  if (subStage === 'primary-applicant') {
    return (
      <div className="form-section space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="form-heading">Primary Applicant Details</h2>
          <SyncStatus status={syncStatus} />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input 
              id="firstName" 
              name="firstName" 
              value={formData.firstName || ''} 
              onChange={handleChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input 
              id="lastName" 
              name="lastName" 
              value={formData.lastName || ''} 
              onChange={handleChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="dob">Date of Birth</Label>
            <Input 
              id="dob" 
              name="dob" 
              type="date" 
              value={formData.dob || ''} 
              onChange={handleChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="employmentType">Employment Type</Label>
            <select 
              id="employmentType" 
              name="employmentType" 
              className="w-full p-2 border rounded-md"
              value={formData.employmentType || ''}
              onChange={(e) => updateField('employmentType', e.target.value)}
            >
              <option value="">Select employment type</option>
              <option value="salaried">Salaried</option>
              <option value="self-employed">Self-employed</option>
              <option value="business">Business Owner</option>
              <option value="retired">Retired</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="income">Monthly Income</Label>
            <Input 
              id="income" 
              name="income" 
              type="number" 
              placeholder="0" 
              value={formData.income || ''} 
              onChange={handleChange}
            />
          </div>
          
          {incomeProof.visible && (
            <div className="space-y-2">
              <Label htmlFor="incomeProofType">Income Proof Type</Label>
              <select 
                id="incomeProofType" 
                name="incomeProofType" 
                className="w-full p-2 border rounded-md"
                value={formData.incomeProofType || ''}
                onChange={(e) => updateField('incomeProofType', e.target.value)}
                disabled={incomeProof.disabled}
              >
                <option value="">Select proof type</option>
                <option value="payslip">Salary Slip</option>
                <option value="bankStatement">Bank Statement</option>
                <option value="taxReturn">Tax Return</option>
              </select>
              {incomeProof.disabled && (
                <p className="text-xs text-muted-foreground">
                  Please enter your income first
                </p>
              )}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="loanAmount">Loan Amount</Label>
            <Input 
              id="loanAmount" 
              name="loanAmount" 
              type="number"
              value={formData.loanAmount || ''} 
              onChange={handleChange}
            />
            {loanAmount.derivedValue && (
              <p className="text-xs text-muted-foreground">
                Based on your income, we recommend a maximum of ${loanAmount.derivedValue.toLocaleString()}
              </p>
            )}
          </div>
          
          {coApplicant.visible && (
            <div className="space-y-2">
              <Label htmlFor="hasCoApplicant">Co-applicant</Label>
              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  id="hasCoApplicant" 
                  name="hasCoApplicant" 
                  checked={formData.hasCoApplicant || false} 
                  onChange={(e) => updateField('hasCoApplicant', e.target.checked)}
                />
                <Label htmlFor="hasCoApplicant" className="text-sm font-normal">
                  This loan has a co-applicant
                </Label>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={prevSubStage}>
            Back
          </Button>
          <Button 
            onClick={nextSubStage}
            disabled={!formData.firstName || !formData.lastName || !formData.income || !formData.employmentType}
          >
            {formData.hasCoApplicant ? 'Continue to Co-applicant' : 'Skip to Bureau Check'}
          </Button>
        </div>
      </div>
    );
  }

  if (subStage === 'co-applicant') {
    // Only show this sub-stage if hasCoApplicant is true
    if (!formData.hasCoApplicant) {
      nextSubStage();
      return null;
    }

    return (
      <div className="form-section space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="form-heading">Co-Applicant Details</h2>
          <SyncStatus status={syncStatus} />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="coFirstName">First Name</Label>
            <Input 
              id="coFirstName" 
              name="coFirstName" 
              value={formData.coFirstName || ''} 
              onChange={handleChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="coLastName">Last Name</Label>
            <Input 
              id="coLastName" 
              name="coLastName" 
              value={formData.coLastName || ''} 
              onChange={handleChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="coRelationship">Relationship to Primary Applicant</Label>
            <select 
              id="coRelationship" 
              name="coRelationship" 
              className="w-full p-2 border rounded-md"
              value={formData.coRelationship || ''}
              onChange={(e) => updateField('coRelationship', e.target.value)}
            >
              <option value="">Select relationship</option>
              <option value="spouse">Spouse</option>
              <option value="parent">Parent</option>
              <option value="child">Child</option>
              <option value="sibling">Sibling</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="coIncome">Monthly Income</Label>
            <Input 
              id="coIncome" 
              name="coIncome" 
              type="number" 
              placeholder="0" 
              value={formData.coIncome || ''} 
              onChange={handleChange}
            />
          </div>
        </div>
        
        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={prevSubStage}>
            Back
          </Button>
          <Button 
            onClick={nextSubStage}
            disabled={!formData.coFirstName || !formData.coLastName}
          >
            Continue
          </Button>
        </div>
      </div>
    );
  }

  if (subStage === 'bureau-check') {
    return (
      <div className="form-section space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="form-heading">Credit Bureau Check</h2>
          <SyncStatus status={syncStatus} />
        </div>
        
        <Card className="p-4">
          <p className="mb-4">
            To proceed with your application, we need to check your credit score. This will not affect your credit score.
          </p>
          
          <div className="flex items-center space-x-2 mb-4">
            <input 
              type="checkbox" 
              id="consentBureau" 
              name="consentBureau" 
              checked={formData.consentBureau || false} 
              onChange={(e) => updateField('consentBureau', e.target.checked)}
            />
            <Label htmlFor="consentBureau" className="text-sm font-normal">
              I consent to a credit check
            </Label>
          </div>
        </Card>
        
        {formData.consentBureau && (
          <ErrorBoundaryWithRetry>
            <TaskMonitorCard 
              taskName="creditBureauCheck"
              title="Credit Bureau Check"
              description="We're checking your credit score with the bureau."
              applicationId="app-1"
            />
          </ErrorBoundaryWithRetry>
        )}
        
        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={prevSubStage}>
            Back
          </Button>
          <Button 
            onClick={nextSubStage}
            disabled={!formData.consentBureau}
          >
            Continue
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
