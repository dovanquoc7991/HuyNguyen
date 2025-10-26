import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@components/ui/dialog";
import { Button } from "@components/ui/button";
import { useToast } from "@hooks/use-toast";
import type { TestData } from "@shared/schemaAdmin";

interface JsonPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  testData: TestData;
}

export default function JsonPreviewModal({ isOpen, onClose, testData }: JsonPreviewModalProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const jsonString = JSON.stringify(testData, null, 2);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(jsonString);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "JSON copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-[90vw] h-[85vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>JSON Output Preview</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 min-h-0 overflow-hidden">
          <div className="h-full bg-gray-900 rounded-lg p-4 overflow-y-auto">
            <pre className="text-sm font-mono text-green-400 whitespace-pre-wrap break-words">
              {jsonString}
            </pre>
          </div>
        </div>

        <div className="flex-shrink-0 flex justify-end space-x-3 pt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={copyToClipboard} className="bg-blue-600 hover:bg-blue-700">
            <i className={`fas fa-${copied ? 'check' : 'copy'} mr-2`}></i>
            {copied ? 'Copied!' : 'Copy JSON'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
