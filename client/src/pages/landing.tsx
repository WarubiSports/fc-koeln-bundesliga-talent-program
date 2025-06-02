import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-fc-red/5 to-gray-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <div className="flex justify-center items-center mb-6">
            <img 
              src="https://germany-socceracademy.com/wp-content/uploads/2023/09/NewCologneLogo.png"
              alt="FC Köln Football School" 
              className="w-20 h-20 object-contain"
            />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            1.FC Köln International Talent Program
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Professional player management and team coordination system
          </p>
        </div>



        <div className="text-center">
          <Card className="inline-block">
            <CardHeader>
              <CardTitle className="text-2xl text-fc-red mb-2">Ready to Access?</CardTitle>
              <CardDescription>
                Sign in with your Replit account to get started
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={() => window.location.href = '/api/login'}
                className="w-full bg-fc-red hover:bg-fc-red/90 text-white px-8 py-3 text-lg"
                size="lg"
              >
                <i className="fas fa-sign-in-alt mr-2"></i>
                Sign In with Replit
              </Button>
              
              <p className="text-xs text-gray-500 mt-4 text-center">
                Your access level will be automatically determined based on your account
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}