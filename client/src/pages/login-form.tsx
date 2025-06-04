import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginForm() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <img 
              src="https://germany-socceracademy.com/wp-content/uploads/2023/09/NewCologneLogo.png" 
              alt="FC Köln Football School" 
              className="w-16 h-16 object-contain mx-auto"
            />
          </div>
          <CardTitle className="text-2xl">Sign in to FC Köln</CardTitle>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full">
            <a href="/api/login">
              Continue with Replit
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}