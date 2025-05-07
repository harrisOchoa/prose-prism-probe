
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { HelpCircle, Mail, MessageCircle, FileText, Video, Search, ExternalLink } from "lucide-react";

const HelpPage = () => {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Help & Support</h1>
        <p className="text-muted-foreground">Get help with using HireScribe</p>
      </div>
      
      <div className="relative">
        <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
        <Input 
          placeholder="Search for help articles..." 
          className="pl-10 h-12 text-lg"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5 text-hirescribe-primary" />
              Documentation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Browse our documentation for detailed guides</p>
            <Button variant="outline" className="w-full">
              View Documentation
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <Video className="mr-2 h-5 w-5 text-hirescribe-primary" />
              Tutorial Videos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Watch step-by-step tutorial videos</p>
            <Button variant="outline" className="w-full">
              Watch Tutorials
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <MessageCircle className="mr-2 h-5 w-5 text-hirescribe-primary" />
              Live Chat Support
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Chat with our support team in real-time</p>
            <Button className="w-full bg-hirescribe-primary hover:bg-hirescribe-accent transition-colors">
              Start Chat
              <MessageCircle className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>Find quick answers to common questions</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>How do I create a new assessment?</AccordionTrigger>
              <AccordionContent>
                To create a new assessment, navigate to the Assessments page and click on the "Create Assessment" button. 
                Follow the step-by-step wizard to configure your assessment details, add questions, and set up parameters.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>How do I invite candidates to take an assessment?</AccordionTrigger>
              <AccordionContent>
                After creating an assessment, go to the assessment details page and click on "Invite Candidates". 
                You can enter email addresses manually or upload a CSV file with candidate information.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>How are assessment scores calculated?</AccordionTrigger>
              <AccordionContent>
                Assessment scores are calculated based on the scoring criteria you set when creating the assessment. 
                For aptitude tests, correct answers add points. For writing assessments, our AI evaluates responses based on clarity, 
                relevance, and depth of knowledge.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>Can I customize the assessment interface?</AccordionTrigger>
              <AccordionContent>
                Yes, you can customize the assessment interface in the Settings section. You can add your company logo, 
                change colors, and modify the welcome message that candidates see when starting their assessment.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5">
              <AccordionTrigger>How do I export assessment results?</AccordionTrigger>
              <AccordionContent>
                To export assessment results, go to the Assessments page, select the assessments you want to export, 
                and click the "Export" button. You can choose between CSV, Excel, or PDF formats.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Contact Support</CardTitle>
          <CardDescription>Get in touch with our support team</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Your Name</Label>
                <Input id="name" placeholder="Enter your name" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" placeholder="Enter your email" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" placeholder="Enter subject" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="message">Message</Label>
                <textarea 
                  id="message" 
                  rows={4} 
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Please describe your issue or question"
                ></textarea>
              </div>
              <Button className="w-full bg-hirescribe-primary hover:bg-hirescribe-accent transition-colors">
                <Mail className="mr-2 h-4 w-4" />
                Send Message
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-muted p-6 rounded-lg">
                <h3 className="text-lg font-medium mb-2">Support Hours</h3>
                <p className="text-sm mb-4">Our team is available during the following hours:</p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Monday - Friday:</span>
                    <span className="font-medium">9:00 AM - 8:00 PM ET</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saturday:</span>
                    <span className="font-medium">10:00 AM - 5:00 PM ET</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sunday:</span>
                    <span className="font-medium">Closed</span>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <h3 className="text-lg font-medium mb-2">Contact Information</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>support@hirescribe.com</span>
                  </div>
                  <div className="flex items-center">
                    <MessageCircle className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>Live chat available during business hours</span>
                  </div>
                </div>
                
                <div className="mt-6">
                  <p className="text-sm text-muted-foreground">For urgent issues, please use live chat for fastest response times.</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Label component since the UI library one is being imported in a different context
const Label = ({ htmlFor, children, className = "" }: { htmlFor: string, children: React.ReactNode, className?: string }) => (
  <label htmlFor={htmlFor} className={`text-sm font-medium ${className}`}>{children}</label>
);

export default HelpPage;
