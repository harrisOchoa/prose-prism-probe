
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Search, Filter, Plus } from "lucide-react";
import EmptyState from "@/components/admin/dashboard/components/EmptyState";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

const AssessmentsPage = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Assessments</h1>
          <p className="text-muted-foreground">Manage and view all assessment submissions</p>
        </div>
        
        <Button className="bg-hirescribe-primary hover:bg-hirescribe-accent transition-colors">
          <Plus className="mr-2 h-4 w-4" />
          Create Assessment
        </Button>
      </div>
      
      <Tabs defaultValue="all">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <TabsList>
            <TabsTrigger value="all">All Assessments</TabsTrigger>
            <TabsTrigger value="active">
              Active 
              <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">24</Badge>
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed
              <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 border-blue-200">56</Badge>
            </TabsTrigger>
            <TabsTrigger value="archived">
              Archived
              <Badge variant="outline" className="ml-2 bg-gray-100 text-gray-700 border-gray-200">12</Badge>
            </TabsTrigger>
          </TabsList>
          
          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search assessments..." 
                className="pl-10 h-9"
              />
            </div>
            <Button variant="outline" size="sm" className="flex gap-2">
              <Filter className="h-4 w-4" />
              <span>Filters</span>
            </Button>
          </div>
        </div>
        
        <TabsContent value="all" className="mt-4">
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-lg flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Assessment Submissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="min-h-[400px] flex items-center justify-center">
                <EmptyState 
                  title="You're currently on the assessments page" 
                  message="This is where all assessment data will be displayed with advanced filtering, sorting, and analysis capabilities."
                  icon={<FileText className="h-12 w-12 text-muted-foreground opacity-70" />}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="active" className="mt-4">
          <Card>
            <CardContent className="py-8">
              <EmptyState 
                title="Active Assessments" 
                message="View all currently active assessment sessions"
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="completed" className="mt-4">
          <Card>
            <CardContent className="py-8">
              <EmptyState 
                title="Completed Assessments" 
                message="View all completed assessment sessions"
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="archived" className="mt-4">
          <Card>
            <CardContent className="py-8">
              <EmptyState 
                title="Archived Assessments" 
                message="View all archived assessment sessions"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AssessmentsPage;
