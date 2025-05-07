
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, PieChart, LineChart, Calendar, Download, BarChart3, PieChart as PieChartIcon } from "lucide-react";
import { Bar, BarChart as ReBarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useAnalytics } from "@/hooks/useAnalytics";
import EmptyState from "@/components/admin/dashboard/components/EmptyState";

const AnalyticsPage = () => {
  const { analytics, loading, error } = useAnalytics();
  const [timePeriod, setTimePeriod] = React.useState("30days");

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      );
    }

    if (error) {
      return (
        <EmptyState 
          title="Error loading analytics" 
          message={error}
          icon={<BarChart className="h-12 w-12 text-muted-foreground opacity-70" />}
        />
      );
    }

    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-md">Assessment Completion Rate</CardTitle>
              <CardDescription>{analytics.completionRate}% overall completion</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-3xl font-bold">{analytics.completionRate}%</div>
              <div className="h-2 w-full bg-gray-100 rounded-full mt-2 mb-1">
                <div className="h-2 bg-hirescribe-primary rounded-full" style={{ width: `${analytics.completionRate}%` }}></div>
              </div>
              <p className="text-xs text-muted-foreground">+12% from previous period</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-md">Average Completion Time</CardTitle>
              <CardDescription>Time to complete assessments</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-3xl font-bold">{analytics.averageCompletionTime}</div>
              <p className="text-xs text-muted-foreground mt-4">-2m 14s from previous period</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-md">Total Assessments</CardTitle>
              <CardDescription>All time</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-3xl font-bold">{analytics.totalAssessments}</div>
              <div className="flex items-center mt-4">
                <div className={`flex h-1.5 w-1.5 rounded-full ${analytics.monthlyGrowth >= 0 ? 'bg-green-500' : 'bg-red-500'} mr-1`}></div>
                <p className={`text-xs ${analytics.monthlyGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {analytics.monthlyGrowth >= 0 ? '+' : ''}{analytics.monthlyGrowth}% this month
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">
              <BarChart3 className="h-4 w-4 mr-1" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="performance">
              <LineChart className="h-4 w-4 mr-1" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="demographics">
              <PieChartIcon className="h-4 w-4 mr-1" />
              Demographics
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Assessment Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ReBarChart data={analytics.assessmentTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="assessments" fill="#9b87f5" name="Assessments" />
                    <Bar dataKey="completions" fill="#6E59A5" name="Completions" />
                  </ReBarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Top Performing Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.categoryPerformance.map((category, index) => (
                      <div key={index}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">{category.name}</span>
                          <span className="text-sm font-medium">{category.percentage}%</span>
                        </div>
                        <div className="h-2 w-full bg-gray-100 rounded-full">
                          <div 
                            className="h-2 bg-hirescribe-primary rounded-full" 
                            style={{ width: `${category.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-start">
                        <div className={`h-2 w-2 rounded-full bg-${activity.color} mt-2 mr-3`}></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.description}</p>
                          <p className="text-xs text-muted-foreground">{activity.position} • {activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="performance" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance Analysis</CardTitle>
              </CardHeader>
              <CardContent className="h-[400px] flex items-center justify-center">
                <EmptyState 
                  title="Performance Analytics" 
                  message="Detailed performance analytics will be available in a future update."
                  icon={<LineChart className="h-12 w-12 text-muted-foreground opacity-70" />}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="demographics" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Demographic Analytics</CardTitle>
              </CardHeader>
              <CardContent className="h-[400px] flex items-center justify-center">
                <EmptyState 
                  title="Demographics Data" 
                  message="Candidate demographic data will be available in a future update."
                  icon={<PieChartIcon className="h-12 w-12 text-muted-foreground opacity-70" />}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Assessment performance and insights</p>
        </div>
        
        <div className="flex gap-2">
          <Select 
            defaultValue={timePeriod} 
            onValueChange={setTimePeriod}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Time period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 3 months</SelectItem>
              <SelectItem value="year">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="flex gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
      
      {renderContent()}
    </div>
  );
};

export default AnalyticsPage;
