import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SimpleLogin() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Access FC Köln System</CardTitle>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full">
            <a href="/api/login">
              Sign In
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}