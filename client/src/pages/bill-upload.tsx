import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { extractBillData, extractFromMultiplePages, extractFromPDF } from "@/lib/ocr";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import BottomNav from "@/components/ui/bottom-nav";
import { Camera, FileText, X, Edit3, Save, Loader2, Upload } from "lucide-react";

interface ExtractedBillData {
  energySupplier: string;
  monthlyBill: number;
  billingMonth: string;
  unitsConsumed: number;
  billTotal: number;
  billBreakdown: string;
  tariffRate: number;
  connectionType: string;
  userAddress: string;
  areaTariff: string;
  dueDate: string;
  isPaid: boolean;
  customerID: string;
  meterNumber: string;
  sanctionedLoad: number;
  confidence: number;
  
  // Additional detailed fields
  readingDate: string;
  billDate: string;
  userName: string;
  securityDeposit: number;
  unitsBilled: number;
  unitsCredited: number;
  
  // Bill breakdown details
  energyCharges: number;
  fpppaCharges: number;
  governmentDuty: number;
  fixedCharges: number;
  previousDue: number;
  
  // Support information
  complaintNumber: string;
  helplineNumber: string;
}

const defaultBillData: ExtractedBillData = {
  energySupplier: "",
  monthlyBill: 0,
  billingMonth: new Date().toISOString().substr(0, 7),
  unitsConsumed: 0,
  billTotal: 0,
  billBreakdown: "",
  tariffRate: 7,
  connectionType: "Domestic",
  userAddress: "",
  areaTariff: "",
  dueDate: "",
  isPaid: false,
  customerID: "",
  meterNumber: "",
  sanctionedLoad: 0,
  confidence: 1.0,
  readingDate: "",
  billDate: "",
  userName: "",
  securityDeposit: 0,
  unitsBilled: 0,
  unitsCredited: 0,
  energyCharges: 0,
  fpppaCharges: 0,
  governmentDuty: 0,
  fixedCharges: 0,
  previousDue: 0,
  complaintNumber: "",
  helplineNumber: "",
};

export default function BillUpload() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [extractedData, setExtractedData] = useState<ExtractedBillData | null>(null);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editableData, setEditableData] = useState<ExtractedBillData | null>(null);

  const saveBillMutation = useMutation({
    mutationFn: async (billData: ExtractedBillData) => {
      const response = await apiRequest("POST", "/api/bills", {
        userId: user?.id,
        ...billData,
      });
      return response.json();
    },
    onSuccess: () => {
      // Invalidate all related queries to refresh home and analytics
      queryClient.invalidateQueries({ queryKey: ["/api/bills"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/usage"] });
      
      toast({
        title: "Bill Saved Successfully!",
        description: "Your bill data has been processed and saved. Check Analytics for insights.",
      });
      
      // Reset state
      setExtractedData(null);
      setEditableData(null);
      setSelectedFiles([]);
      setPreviewUrls([]);
      setShowManualEntry(false);
      setIsEditing(false);
    },
    onError: (error: any) => {
      console.error('Save bill error:', error);
      toast({
        title: "Failed to Save Bill",
        description: "Please check all required fields and try again.",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(file => 
      file.type.startsWith('image/') || file.type === 'application/pdf'
    );
    
    if (validFiles.length === 0) {
      toast({
        title: "Invalid File Type",
        description: "Please select image files (PNG, JPG) or PDF files",
        variant: "destructive",
      });
      return;
    }

    setSelectedFiles(validFiles);
    
    // Create preview URLs for images only
    const imageFiles = validFiles.filter(file => file.type.startsWith('image/'));
    const urls = imageFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  const processFiles = async () => {
    if (selectedFiles.length === 0) return;
    
    setIsProcessing(true);
    setProcessingProgress(0);
    
    try {
      let result: ExtractedBillData;
      
      const pdfFiles = selectedFiles.filter(file => file.type === 'application/pdf');
      const imageFiles = selectedFiles.filter(file => file.type.startsWith('image/'));
      
      if (pdfFiles.length > 0) {
        setProcessingProgress(30);
        result = await extractFromPDF(pdfFiles[0]);
        setProcessingProgress(80);
      } else if (imageFiles.length === 1) {
        setProcessingProgress(50);
        result = await extractBillData(imageFiles[0]);
      } else {
        // Multi-page processing
        result = await extractFromMultiplePages(imageFiles);
      }
      
      setProcessingProgress(100);
      setExtractedData(result);
      setEditableData({ ...result });
      
      if (isValidExtraction(result)) {
        toast({
          title: "Bill Processed Successfully!",
          description: `Data extracted with ${Math.round(result.confidence * 100)}% confidence`,
        });
      } else {
        toast({
          title: "Processing Complete",
          description: "Some data may be missing. Please review and edit manually.",
        });
        setIsEditing(true);
      }
    } catch (error) {
      console.error('Processing failed:', error);
      toast({
        title: "Processing Failed",
        description: "Please try again or enter details manually.",
        variant: "destructive",
      });
      setShowManualEntry(true);
      setEditableData({ ...defaultBillData });
    } finally {
      setIsProcessing(false);
      setProcessingProgress(0);
    }
  };

  const isValidExtraction = (data: ExtractedBillData): boolean => {
    return !!(data.energySupplier && data.monthlyBill && data.unitsConsumed && data.confidence > 0.7);
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newUrls = previewUrls.filter((_, i) => i !== index);
    
    setSelectedFiles(newFiles);
    setPreviewUrls(newUrls);
    
    if (newFiles.length === 0) {
      setExtractedData(null);
      setEditableData(null);
    }
  };

  const handleSaveBill = () => {
    const dataToSave = editableData;
    if (!dataToSave) return;
    
    // Validate required fields
    if (!dataToSave.energySupplier || !dataToSave.billTotal || !dataToSave.unitsConsumed) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in Energy Supplier, Bill Total, and Units Consumed",
        variant: "destructive",
      });
      return;
    }
    
    saveBillMutation.mutate(dataToSave);
  };

  const startManualEntry = () => {
    setShowManualEntry(true);
    setEditableData({ ...defaultBillData });
    setIsEditing(true);
  };

  const updateField = (field: keyof ExtractedBillData, value: any) => {
    if (!editableData) return;
    setEditableData({
      ...editableData,
      [field]: value
    });
  };

  return (
    <div className="min-h-screen gradient-bg pb-20">
      <div className="container mx-auto px-4 py-8 max-w-md">
        {/* Premium Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extralight minimal-text mb-2">Bill Intelligence</h1>
            <p className="text-sm minimal-text-muted tracking-wide">Neural OCR Scanner</p>
          </div>
          <div className="w-16 h-16 gradient-secondary rounded-2xl flex items-center justify-center futuristic-glow">
            <FileText className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* Neural Upload Area */}
        <Card className="mb-8 neo-card rounded-3xl border-0 shadow-2xl hover:futuristic-glow transition-all duration-300">
          <CardContent className="p-8 text-center">
            {isProcessing ? (
              <div className="space-y-6">
                <div className="w-16 h-16 gradient-accent rounded-2xl flex items-center justify-center futuristic-glow mx-auto">
                  <Loader2 className="w-8 h-8 animate-spin text-white" />
                </div>
                <p className="text-lg font-light minimal-text">
                  {selectedFiles.some(f => f.type === 'application/pdf') 
                    ? "Neural PDF Processing..." 
                    : "Optical Character Recognition..."}
                </p>
                {processingProgress > 0 && (
                  <div className="w-full glass-morphism rounded-full h-4 overflow-hidden">
                    <div 
                      className="gradient-accent h-4 rounded-full transition-all duration-500 ease-out futuristic-glow" 
                      style={{ width: `${processingProgress}%` }}
                    ></div>
                  </div>
                )}
                <p className="text-xs minimal-text-muted">
                  {processingProgress < 30 ? "Initializing neural network..." : 
                   processingProgress < 70 ? "Extracting data patterns..." : 
                   "Finalizing intelligence..."}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="w-16 h-16 gradient-secondary rounded-2xl flex items-center justify-center futuristic-glow mx-auto">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-light minimal-text mb-4">Neural Document Scanner</h3>
                  <p className="minimal-text-muted mb-6 leading-relaxed">Advanced OCR with multi-format support</p>
                </div>
                <input
                  type="file"
                  accept="image/*,.pdf,application/pdf"
                  onChange={(e) => handleFileSelect(e.target.files)}
                  className="hidden"
                  id="file-upload"
                  multiple
                />
                <div className="space-y-4">
                  <label
                    htmlFor="file-upload"
                    className="inline-flex items-center px-8 py-4 gradient-secondary text-white rounded-2xl cursor-pointer hover:futuristic-glow transition-all duration-300 font-light"
                  >
                    <Upload className="w-6 h-6 mr-3" />
                    Upload Documents
                  </label>
                  <p className="text-xs minimal-text-muted tracking-wide">
                    JPG, PNG, PDF supported • Neural multi-page analysis
                  </p>
                  <Button
                    variant="ghost"
                    onClick={startManualEntry}
                    className="glass-morphism rounded-2xl px-6 py-3 minimal-text hover:futuristic-glow"
                  >
                    <Edit3 className="w-5 h-5 mr-2" />
                    Manual Data Entry
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* File Previews */}
        {selectedFiles.length > 0 && (
          <Card className="mb-6 gradient-card border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-gradient-green flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Selected Files ({selectedFiles.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg">
                  <div className="flex items-center gap-3">
                    {file.type === 'application/pdf' ? (
                      <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-6 h-6 text-red-600" />
                      </div>
                    ) : (
                      <img 
                        src={previewUrls[selectedFiles.filter(f => f.type.startsWith('image/')).indexOf(file)]} 
                        alt="Preview" 
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                    )}
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => removeFile(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button 
                onClick={processFiles}
                className="w-full gradient-green text-white"
                disabled={isProcessing}
              >
                {isProcessing ? "Processing..." : "Analyze Files"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Extracted Data Display/Edit */}
        {(extractedData || showManualEntry) && editableData && (
          <div className="space-y-6">
            {/* Basic Information */}
            <Card className="gradient-card border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-gradient-green flex items-center justify-between">
                  Basic Bill Information
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    {isEditing ? "View" : "Edit"}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Energy Supplier*</label>
                    {isEditing ? (
                      <Input
                        value={editableData.energySupplier}
                        onChange={(e) => updateField('energySupplier', e.target.value)}
                        placeholder="e.g., Torrent Power"
                      />
                    ) : (
                      <p className="font-medium">{editableData.energySupplier || "Not detected"}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Billing Month*</label>
                    {isEditing ? (
                      <Input
                        type="month"
                        value={editableData.billingMonth}
                        onChange={(e) => updateField('billingMonth', e.target.value)}
                      />
                    ) : (
                      <p className="font-medium">{editableData.billingMonth || "Not detected"}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Units Consumed*</label>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={editableData.unitsConsumed}
                        onChange={(e) => updateField('unitsConsumed', Number(e.target.value))}
                      />
                    ) : (
                      <p className="font-medium">{editableData.unitsConsumed} kWh</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Bill Total*</label>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={editableData.billTotal}
                        onChange={(e) => updateField('billTotal', Number(e.target.value))}
                      />
                    ) : (
                      <p className="font-medium">₹{editableData.billTotal}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Information */}
            <Card className="gradient-card border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-gradient-green">Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Customer ID</label>
                    {isEditing ? (
                      <Input
                        value={editableData.customerID}
                        onChange={(e) => updateField('customerID', e.target.value)}
                      />
                    ) : (
                      <p className="font-medium">{editableData.customerID || "Not detected"}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">User Name</label>
                    {isEditing ? (
                      <Input
                        value={editableData.userName}
                        onChange={(e) => updateField('userName', e.target.value)}
                      />
                    ) : (
                      <p className="font-medium">{editableData.userName || "Not detected"}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Meter Number</label>
                    {isEditing ? (
                      <Input
                        value={editableData.meterNumber}
                        onChange={(e) => updateField('meterNumber', e.target.value)}
                      />
                    ) : (
                      <p className="font-medium">{editableData.meterNumber || "Not detected"}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Sanctioned Load</label>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={editableData.sanctionedLoad}
                        onChange={(e) => updateField('sanctionedLoad', Number(e.target.value))}
                      />
                    ) : (
                      <p className="font-medium">{editableData.sanctionedLoad} kW</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">User Address</label>
                  {isEditing ? (
                    <Input
                      value={editableData.userAddress}
                      onChange={(e) => updateField('userAddress', e.target.value)}
                    />
                  ) : (
                    <p className="font-medium">{editableData.userAddress || "Not detected"}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Bill Dates & Details */}
            <Card className="gradient-card border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-gradient-green">Bill Dates & Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Reading Date</label>
                    {isEditing ? (
                      <Input
                        type="date"
                        value={editableData.readingDate}
                        onChange={(e) => updateField('readingDate', e.target.value)}
                      />
                    ) : (
                      <p className="font-medium">{editableData.readingDate || "Not detected"}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Bill Date</label>
                    {isEditing ? (
                      <Input
                        type="date"
                        value={editableData.billDate}
                        onChange={(e) => updateField('billDate', e.target.value)}
                      />
                    ) : (
                      <p className="font-medium">{editableData.billDate || "Not detected"}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Due Date</label>
                    {isEditing ? (
                      <Input
                        type="date"
                        value={editableData.dueDate}
                        onChange={(e) => updateField('dueDate', e.target.value)}
                      />
                    ) : (
                      <p className="font-medium">{editableData.dueDate || "Not detected"}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Security Deposit</label>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={editableData.securityDeposit}
                        onChange={(e) => updateField('securityDeposit', Number(e.target.value))}
                      />
                    ) : (
                      <p className="font-medium">₹{editableData.securityDeposit}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Units Billed</label>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={editableData.unitsBilled}
                        onChange={(e) => updateField('unitsBilled', Number(e.target.value))}
                      />
                    ) : (
                      <p className="font-medium">{editableData.unitsBilled} kWh</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Units Credited</label>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={editableData.unitsCredited}
                        onChange={(e) => updateField('unitsCredited', Number(e.target.value))}
                      />
                    ) : (
                      <p className="font-medium">{editableData.unitsCredited} kWh</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bill Breakdown */}
            <Card className="gradient-card border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-gradient-green">Bill Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Energy Charges</label>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={editableData.energyCharges}
                        onChange={(e) => updateField('energyCharges', Number(e.target.value))}
                      />
                    ) : (
                      <p className="font-medium">₹{editableData.energyCharges}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">FPPPA Charges</label>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={editableData.fpppaCharges}
                        onChange={(e) => updateField('fpppaCharges', Number(e.target.value))}
                      />
                    ) : (
                      <p className="font-medium">₹{editableData.fpppaCharges}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Government Duty</label>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={editableData.governmentDuty}
                        onChange={(e) => updateField('governmentDuty', Number(e.target.value))}
                      />
                    ) : (
                      <p className="font-medium">₹{editableData.governmentDuty}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Fixed Charges</label>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={editableData.fixedCharges}
                        onChange={(e) => updateField('fixedCharges', Number(e.target.value))}
                      />
                    ) : (
                      <p className="font-medium">₹{editableData.fixedCharges}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Previous Due</label>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={editableData.previousDue}
                        onChange={(e) => updateField('previousDue', Number(e.target.value))}
                      />
                    ) : (
                      <p className="font-medium">₹{editableData.previousDue}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>



            {/* Confidence & Save */}
            {extractedData && (
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-700 mb-2">
                  Extraction Confidence: {Math.round(editableData.confidence * 100)}%
                </p>
                <p className="text-xs text-green-600">
                  Review the extracted information above and make corrections if needed
                </p>
              </div>
            )}
            
            <Button 
              onClick={handleSaveBill}
              className="w-full gradient-green text-white"
              disabled={saveBillMutation.isPending}
            >
              <Save className="w-4 h-4 mr-2" />
              {saveBillMutation.isPending ? "Saving..." : "Save Bill Data"}
            </Button>
          </div>
        )}

        <BottomNav />
      </div>
    </div>
  );
}