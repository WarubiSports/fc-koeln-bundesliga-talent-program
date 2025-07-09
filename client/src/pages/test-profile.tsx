import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function TestProfile() {
  const [firstName, setFirstName] = useState("Max");
  const [lastName, setLastName] = useState("Bisinger");
  const [email, setEmail] = useState("max.bisinger@warubi-sports.com");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState("");

  const handleButtonClick = () => {
    alert("Test button works!");
    console.log("Button clicked successfully");
  };

  return (
    <div className="container max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Test Profile Edit</h1>
      
      <div className="space-y-4">
        <div>
          <Label>First Name</Label>
          <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
        </div>
        
        <div>
          <Label>Last Name</Label>
          <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
        </div>
        
        <div>
          <Label>Email</Label>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        
        <div>
          <Label>Phone Number</Label>
          <Input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
        </div>
        
        <div>
          <Label>Emergency Contact Name</Label>
          <Input value={emergencyContactName} onChange={(e) => setEmergencyContactName(e.target.value)} />
        </div>
        
        <div>
          <Label>Emergency Contact Phone</Label>
          <Input value={emergencyContactPhone} onChange={(e) => setEmergencyContactPhone(e.target.value)} />
        </div>
        
        <Button onClick={handleButtonClick} className="bg-blue-600 hover:bg-blue-700">
          Test Button
        </Button>
      </div>
    </div>
  );
}