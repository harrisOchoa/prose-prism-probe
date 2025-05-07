
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Search, UserPlus, Filter } from "lucide-react";
import EmptyState from "@/components/admin/dashboard/components/EmptyState";

const CandidatesPage = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Candidates</h1>
          <p className="text-muted-foreground">Manage and view all candidate information</p>
        </div>
        
        <Button className="bg-hirescribe-primary hover:bg-hirescribe-accent transition-colors">
          <UserPlus className="mr-2 h-4 w-4" />
          Add New Candidate
        </Button>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Search candidates..." 
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="flex gap-2">
          <Filter className="h-4 w-4" />
          <span>Filters</span>
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Users className="mr-2 h-5 w-5" />
            Candidate List
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState 
            title="No candidates found" 
            message="There are no candidates registered in the system yet. Add your first candidate to get started."
            actionLabel="Add Candidate"
            onAction={() => {}}
            icon={<Users className="h-12 w-12 text-muted-foreground opacity-70" />}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default CandidatesPage;
