
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, PieChart, LineChart, Calendar, Download, BarChart3, PieChart as PieChartIcon } from "lucide-react";
import { Bar, BarChart as ReBarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const data = [
  { name: "Jan", assessments: 10, completions: 8 },
  { name: "Feb", assessments: 15, completions: 12 },
  { name: "Mar", assessments: 25, completions: 20 },
  { name: "Apr", assessments: 22, completions: 18 },
  { name: "May", assessments: 30, completions: 27 },
];

const AnalyticsPage = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Assessment performance and insights</p>
        </div>
        
        <div className="flex gap-2">
          <Select defaultValue="30days">
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
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-md">Assessment Completion Rate</CardTitle>
            <CardDescription>86% overall completion</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-bold">86%</div>
            <div className="h-2 w-full bg-gray-100 rounded-full mt-2 mb-1">
              <div className="h-2 bg-hirescribe-primary rounded-full" style={{ width: "86%" }}></div>
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
            <div className="text-3xl font-bold">24m 36s</div>
            <p className="text-xs text-muted-foreground mt-4">-2m 14s from previous period</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-md">Total Assessments</CardTitle>
            <CardDescription>All time</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-bold">1,243</div>
            <div className="flex items-center mt-4">
              <div className="flex h-1.5 w-1.5 rounded-full bg-green-500 mr-1"></div>
              <p className="text-xs text-green-500">+24% this month</p>
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
                <ReBarChart data={data}>
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
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Critical Thinking</span>
                      <span className="text-sm font-medium">92%</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full">
                      <div className="h-2 bg-hirescribe-primary rounded-full" style={{ width: "92%" }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Problem Solving</span>
                      <span className="text-sm font-medium">87%</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full">
                      <div className="h-2 bg-hirescribe-primary rounded-full" style={{ width: "87%" }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Communication</span>
                      <span className="text-sm font-medium">75%</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full">
                      <div className="h-2 bg-hirescribe-primary rounded-full" style={{ width: "75%" }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Technical Knowledge</span>
                      <span className="text-sm font-medium">68%</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full">
                      <div className="h-2 bg-hirescribe-primary rounded-full" style={{ width: "68%" }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="h-2 w-2 rounded-full bg-blue-500 mt-2 mr-3"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">John Doe completed assessment</p>
                      <p className="text-xs text-muted-foreground">Frontend Developer • 2 hours ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="h-2 w-2 rounded-full bg-green-500 mt-2 mr-3"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">New assessment created</p>
                      <p className="text-xs text-muted-foreground">UX Designer • 4 hours ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="h-2 w-2 rounded-full bg-purple-500 mt-2 mr-3"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Assessment template updated</p>
                      <p className="text-xs text-muted-foreground">Product Manager • 1 day ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="h-2 w-2 rounded-full bg-orange-500 mt-2 mr-3"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Jane Smith started assessment</p>
                      <p className="text-xs text-muted-foreground">Backend Developer • 1 day ago</p>
                    </div>
                  </div>
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
              <p className="text-muted-foreground">Detailed performance analytics will be displayed here</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="demographics" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Demographic Analytics</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px] flex items-center justify-center">
              <p className="text-muted-foreground">Candidate demographic data will be displayed here</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsPage;
