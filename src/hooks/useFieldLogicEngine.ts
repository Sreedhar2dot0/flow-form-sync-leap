
import { useEffect, useState } from 'react';
import { FormData } from './useMultiStageForm';

type Condition = {
  field: string;
  operator: 'equals' | 'notEquals' | 'greaterThan' | 'lessThan' | 'contains' | 'exists';
  value?: any;
};

type DerivedValue = {
  formula: string;
  dependencies: string[];
};

export type FieldConfig = {
  name: string;
  visibilityRules?: Condition[];
  enablementRules?: Condition[];
  derivedValue?: DerivedValue;
};

export const useFieldLogicEngine = (fieldConfig: FieldConfig, formData: FormData) => {
  const [visible, setVisible] = useState(true);
  const [disabled, setDisabled] = useState(false);
  const [derivedValue, setDerivedValue] = useState<any>(null);

  // Evaluate visibility rules
  useEffect(() => {
    if (fieldConfig.visibilityRules && fieldConfig.visibilityRules.length > 0) {
      const isVisible = evaluateConditions(fieldConfig.visibilityRules, formData);
      setVisible(isVisible);
    } else {
      setVisible(true);
    }
  }, [fieldConfig, formData]);

  // Evaluate enablement rules
  useEffect(() => {
    if (fieldConfig.enablementRules && fieldConfig.enablementRules.length > 0) {
      const isEnabled = evaluateConditions(fieldConfig.enablementRules, formData);
      setDisabled(!isEnabled);
    } else {
      setDisabled(false);
    }
  }, [fieldConfig, formData]);

  // Calculate derived value
  useEffect(() => {
    if (fieldConfig.derivedValue) {
      try {
        // Simple formula evaluation
        // In a real app, you would use a proper formula parser library
        
        // For demonstration purposes, we'll just handle some basic cases
        if (fieldConfig.derivedValue.formula === 'income * 0.5') {
          const income = Number(formData['income'] || 0);
          setDerivedValue(income * 0.5);
        }
        else if (fieldConfig.derivedValue.formula === 'firstName + " " + lastName') {
          const firstName = formData['firstName'] || '';
          const lastName = formData['lastName'] || '';
          setDerivedValue(`${firstName} ${lastName}`);
        }
        else if (fieldConfig.derivedValue.formula === 'loanAmount * 1.1') {
          const loanAmount = Number(formData['loanAmount'] || 0);
          setDerivedValue(loanAmount * 1.1);
        }
      } catch (error) {
        console.error('Error calculating derived value:', error);
        setDerivedValue(null);
      }
    }
  }, [fieldConfig, formData]);

  return { visible, disabled, derivedValue };
};

// Evaluate a set of conditions against form data
const evaluateConditions = (conditions: Condition[], formData: FormData): boolean => {
  return conditions.every(condition => {
    const fieldValue = formData[condition.field];
    
    switch (condition.operator) {
      case 'equals':
        return fieldValue === condition.value;
        
      case 'notEquals':
        return fieldValue !== condition.value;
        
      case 'greaterThan':
        return Number(fieldValue) > Number(condition.value);
        
      case 'lessThan':
        return Number(fieldValue) < Number(condition.value);
        
      case 'contains':
        return typeof fieldValue === 'string' && 
          fieldValue.toLowerCase().includes(String(condition.value).toLowerCase());
          
      case 'exists':
        return fieldValue !== undefined && fieldValue !== null && fieldValue !== '';
        
      default:
        return true;
    }
  });
};
