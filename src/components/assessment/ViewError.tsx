
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ViewErrorProps {
  error: string;
}

const ViewError: React.FC<ViewErrorProps> = ({ error }) => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto py-10 px-4">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-red-500">Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{error}</p>
          <Button 
            className="mt-4" 
            onClick={() => navigate('/admin')}
          >
            Back to Admin
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ViewError;
