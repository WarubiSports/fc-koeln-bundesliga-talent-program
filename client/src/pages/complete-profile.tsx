import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function CompleteProfile() {
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [nationality, setNationality] = useState("");
  const [position, setPosition] = useState("");

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
          <p className="text-gray-600">Please provide additional information to access the system</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="dateOfBirth">Date of Birth</Label>
            <Input
              id="dateOfBirth"
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="nationality">Nationality</Label>
            <Input
              id="nationality"
              placeholder="e.g., German, Brazilian"
              value={nationality}
              onChange={(e) => setNationality(e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="position">Position</Label>
            <Select value={position} onValueChange={setPosition}>
              <SelectTrigger>
                <SelectValue placeholder="Select your position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="goalkeeper">Goalkeeper</SelectItem>
                <SelectItem value="defender">Defender</SelectItem>
                <SelectItem value="midfielder">Midfielder</SelectItem>
                <SelectItem value="forward">Forward</SelectItem>
                <SelectItem value="coach">Coach</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button className="w-full">
            Complete Profile
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}