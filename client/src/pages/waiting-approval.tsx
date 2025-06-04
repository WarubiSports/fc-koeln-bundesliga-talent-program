import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, CheckCircle } from "lucide-react";

export default function WaitingApproval() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
          <CardTitle className="text-2xl">Awaiting Approval</CardTitle>
          <p className="text-gray-600">Your profile is under review</p>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Profile completed</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-yellow-500" />
              <span>Admin approval pending</span>
            </div>
          </div>
          
          <p className="text-sm text-gray-600">
            An administrator will review your profile and approve your access. 
            You'll receive notification once approved.
          </p>
          
          <Button variant="outline" asChild className="w-full">
            <a href="/logout">
              Sign Out
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}