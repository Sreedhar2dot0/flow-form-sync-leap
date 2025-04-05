
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useMultiStageForm, FormData } from "@/hooks/useMultiStageForm";
import { SyncStatus } from "../workflow/SyncStatus";

interface LeadCaptureStageProps {
  subStage: string;
}

export function LeadCaptureStage({ subStage }: LeadCaptureStageProps) {
  const { updateField, formData, nextSubStage, syncStatus } = useMultiStageForm('app-1');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateField(name, value);
  };

  const handleSendOtp = () => {
    if (formData.phone) {
      setOtpSent(true);
      // In a real app, this would trigger an API call to send OTP
      console.log("Sending OTP to", formData.phone);
    }
  };

  const handleVerifyOtp = () => {
    // In a real app, this would verify the OTP with an API call
    if (otp === '1234') { // mock validation
      updateField('otpVerified', true);
      nextSubStage();
    } else {
      alert('Invalid OTP. Try 1234 for the demo.');
    }
  };

  if (subStage === 'basic-details') {
    return (
      <div className="form-section space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="form-heading">Basic Customer Details</h2>
          <SyncStatus status={syncStatus} />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input 
              id="fullName" 
              name="fullName" 
              placeholder="John Doe" 
              value={formData.fullName || ''} 
              onChange={handleChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input 
              id="email" 
              name="email" 
              type="email" 
              placeholder="john@example.com" 
              value={formData.email || ''} 
              onChange={handleChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Mobile Number</Label>
            <Input 
              id="phone" 
              name="phone" 
              placeholder="(123) 456-7890" 
              value={formData.phone || ''} 
              onChange={handleChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="loanType">Loan Type</Label>
            <select 
              id="loanType" 
              name="loanType" 
              className="w-full p-2 border rounded-md"
              value={formData.loanType || 'Personal'}
              onChange={(e) => updateField('loanType', e.target.value)}
            >
              <option value="Personal">Personal Loan</option>
              <option value="Home">Home Loan</option>
              <option value="Auto">Auto Loan</option>
              <option value="Education">Education Loan</option>
            </select>
          </div>
        </div>
        
        <div className="flex justify-end mt-6">
          <Button 
            onClick={nextSubStage} 
            disabled={!formData.fullName || !formData.email || !formData.phone}
          >
            Continue
          </Button>
        </div>
      </div>
    );
  }

  if (subStage === 'otp-verification') {
    return (
      <div className="form-section space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="form-heading">Mobile Verification</h2>
          <SyncStatus status={syncStatus} />
        </div>
        
        <Card className="p-4">
          <div className="space-y-4">
            <p>We need to verify your mobile number {formData.phone}</p>
            
            {!otpSent ? (
              <Button onClick={handleSendOtp}>Send OTP</Button>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Enter the OTP sent to your mobile (use 1234 for demo)
                </p>
                
                <div className="flex space-x-2">
                  <Input 
                    placeholder="Enter OTP" 
                    value={otp} 
                    onChange={(e) => setOtp(e.target.value)}
                    className="max-w-[200px]"
                  />
                  <Button onClick={handleVerifyOtp}>Verify</Button>
                </div>
                
                <p className="text-sm">
                  <button 
                    onClick={handleSendOtp} 
                    className="text-primary hover:underline"
                  >
                    Resend OTP
                  </button>
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>
    );
  }

  return null;
}
