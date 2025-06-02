import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function WaitingApproval() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mb-4">
            <i className="fas fa-clock text-white text-xl"></i>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Waiting for Approval
          </CardTitle>
          <CardDescription>
            Thank you for completing your profile! Your application has been submitted to the 1.FC Köln International Talent Program administrators.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <i className="fas fa-info-circle text-blue-500 mt-1 mr-3"></i>
              <div className="text-left">
                <h4 className="font-medium text-blue-900 mb-1">What happens next?</h4>
                <p className="text-blue-700 text-sm">
                  Our administrators will review your application and approve your access to the talent program platform. You'll receive an email notification once approved.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start">
              <i className="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
              <div className="text-left">
                <h4 className="font-medium text-green-900 mb-1">Profile Complete</h4>
                <p className="text-green-700 text-sm">
                  Your player profile has been successfully submitted with all required information.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => window.location.href = '/api/logout'}
              variant="outline"
              className="w-full"
            >
              <i className="fas fa-sign-out-alt mr-2"></i>
              Sign Out
            </Button>
            
            <Button
              onClick={() => window.location.reload()}
              className="w-full bg-fc-red hover:bg-fc-red/90 text-white"
            >
              <i className="fas fa-refresh mr-2"></i>
              Check Status
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}