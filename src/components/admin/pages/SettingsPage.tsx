
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Key, Bell, Shield, Bot, FileText } from "lucide-react";

const SettingsPage = () => {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>
      
      <Tabs defaultValue="general">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" /> General
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Key className="h-4 w-4" /> Security
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" /> Notifications
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Shield className="h-4 w-4" /> Privacy
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Bot className="h-4 w-4" /> AI Settings
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Manage your account preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Organization Name</Label>
                  <Input id="name" defaultValue="HireScribe Inc." />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Admin Email</Label>
                  <Input id="email" type="email" defaultValue="admin@hirescribe.com" />
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Application Settings</h3>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Dark Mode</Label>
                    <p className="text-sm text-muted-foreground">Toggle between light and dark mode</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive email notifications for important updates</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Compact View</Label>
                    <p className="text-sm text-muted-foreground">Use compact view for assessment listings</p>
                  </div>
                  <Switch />
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline">Cancel</Button>
                <Button className="bg-hirescribe-primary hover:bg-hirescribe-accent transition-colors">Save Changes</Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Assessment Templates</CardTitle>
              <CardDescription>Configure default assessment templates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium">Frontend Developer Assessment</div>
                  <p className="text-sm text-muted-foreground">JavaScript, React, CSS</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">Edit</Button>
                  <Button variant="outline" size="sm">Duplicate</Button>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium">Backend Developer Assessment</div>
                  <p className="text-sm text-muted-foreground">Node.js, Python, SQL</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">Edit</Button>
                  <Button variant="outline" size="sm">Duplicate</Button>
                </div>
              </div>
              
              <div className="mt-6">
                <Button variant="outline" className="w-full">
                  <FileText className="mr-2 h-4 w-4" />
                  Create New Template
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your security preferences</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
              <p className="text-muted-foreground">Security settings will be displayed here</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Manage your notification settings</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
              <p className="text-muted-foreground">Notification settings will be displayed here</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="privacy" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>Manage your privacy preferences</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
              <p className="text-muted-foreground">Privacy settings will be displayed here</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="ai" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Configuration</CardTitle>
              <CardDescription>Configure AI behavior and analysis settings</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
              <p className="text-muted-foreground">AI configuration settings will be displayed here</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
