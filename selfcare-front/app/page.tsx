"use client";

import type React from "react";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { ThemeToggle } from "@/components/theme-toggle";
import { getApiUrl, API_CONFIG } from "@/lib/api-config";

export default function MLTrainingApp() {
  const [jsonData, setJsonData] = useState("");
  const [isValidJson, setIsValidJson] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isRecomputing, setIsRecomputing] = useState(false);
  const [modelRecomputeSuccess, setModelRecomputeSuccess] = useState(false);

  // Hospital information for training
  const [hospitalUUID, setHospitalUUID] = useState("");

  // Prediction form state - updated to match API parameters
  const [heartRate, setHeartRate] = useState("");
  const [bloodPressureDiastolic, setBloodPressureDiastolic] = useState("");
  const [bloodPressureSistolic, setBloodPressureSistolic] = useState("");
  const [age, setAge] = useState("");
  const [isPredicting, setIsPredicting] = useState(false);
  const [prediction, setPrediction] = useState<{
    message: string;
    prediction: number;
  } | null>(null);

  const { toast } = useToast();

  // Validate JSON
  const validateJson = (text: string) => {
    try {
      JSON.parse(text);
      setIsValidJson(true);
    } catch {
      setIsValidJson(false);
    }
  };

  // Handle textarea change
  const handleJsonChange = (value: string) => {
    setJsonData(value);
    validateJson(value);
  };

  // Handle file drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const jsonFile = files.find(
      (file) => file.type === "application/json" || file.name.endsWith(".json")
    );

    if (jsonFile) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setJsonData(content);
        validateJson(content);
      };
      reader.readAsText(jsonFile);
    } else {
      toast({
        title: "Invalid file type",
        description: "Please drop a JSON file",
        variant: "destructive",
      });
    }
  };

  // Handle drag events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  // Publish training data - updated to use real API
  const handlePublish = async () => {
    if (!hospitalUUID) {
      toast({
        title: "Information manquante",
        description: "Veuillez fournir l'UUID de l'hôpital",
        variant: "destructive",
      });
      return;
    }

    setIsPublishing(true);
    try {
      // Artificial delay of 3 seconds
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const response = await axios.post(
        getApiUrl(API_CONFIG.ENDPOINTS.COMPUTE),
        {
          hospitalUUID: hospitalUUID,
          patients: JSON.parse(jsonData)
          // If you want to include training data, you can add it here
          // trainingData: JSON.parse(jsonData)
        }
      );

      toast({
        title: "Succès",
        description: "Le calcul du modèle a été terminé avec succès",
      });

      console.log("Computation result:", response.data);
      setJsonData("");
      setIsValidJson(false);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.response?.data?.message || "Échec du calcul du modèle",
        variant: "destructive",
      });
    } finally {
      setIsPublishing(false);
    }
  };

  // Handle prediction - updated to use real API
  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPredicting(true);
    setPrediction(null);

    try {
      const response = await axios.post(
        getApiUrl(API_CONFIG.ENDPOINTS.PREDICT),
        {
          heartrate_average_last_3_days: Number.parseFloat(heartRate),
          blood_pressure_diastolic: Number.parseFloat(bloodPressureDiastolic),
          blood_pressure_sistolic: Number.parseFloat(bloodPressureSistolic),
          age: Number.parseFloat(age),
        }
      );

      setPrediction({
        message: response.data.message,
        prediction: response.data.prediction,
      });

      toast({
        title: "Prediction Complete",
        description: "Life expectancy prediction generated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to get prediction",
        variant: "destructive",
      });
    } finally {
      setIsPredicting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Selfcare</h1>
            <p className="text-muted-foreground">
              Train your model and make predictions without sharing your data
            </p>
          </div>
          <ThemeToggle />
        </div>

        <Tabs defaultValue="training" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="training">Training</TabsTrigger>
            <TabsTrigger value="predict">Predict</TabsTrigger>
          </TabsList>

          <TabsContent value="training" className="space-y-6">
            {/* Hospital Information Card */}
            <Card className="border-border/50 dark:border-border/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Hospital Information
                </CardTitle>
                <CardDescription>
                  Provide your hospital details to compute the model
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="hospitalUUID">Hospital UUID</Label>
                    <Input
                      id="hospitalUUID"
                      type="text"
                      value={hospitalUUID}
                      onChange={(e) => setHospitalUUID(e.target.value)}
                      placeholder="Enter hospital UUID"
                      className="border-border/50 dark:border-border/20"
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Training Data Card */}
            <Card className="border-border/50 dark:border-border/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Training Data (Optional)
                </CardTitle>
                <CardDescription>
                  Upload or paste JSON training data. You can drag and drop a
                  JSON file or paste the content directly.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div
                  className={`relative ${
                    isDragOver
                      ? "border-primary bg-primary/5"
                      : "border-border/40 dark:border-border/20"
                  } border-2 border-dashed rounded-lg transition-colors`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                >
                  <Textarea
                    placeholder="Paste your JSON training data here or drag and drop a JSON file..."
                    value={jsonData}
                    onChange={(e) => handleJsonChange(e.target.value)}
                    className="min-h-[200px] border-0 resize-none focus-visible:ring-0 bg-transparent"
                  />
                  {isDragOver && (
                    <div className="absolute inset-0 flex items-center justify-center bg-primary/10 rounded-lg">
                      <p className="text-primary font-medium">
                        Drop JSON file here
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        isValidJson ? "bg-green-500" : "bg-red-500"
                      }`}
                    />
                    <span className="text-sm text-muted-foreground">
                      {isValidJson ? "Valid JSON" : "Invalid JSON"}
                    </span>
                  </div>

                  <Button
                    onClick={handlePublish}
                    disabled={!hospitalUUID || isPublishing || isRecomputing}
                    className="min-w-[100px]"
                  >
                    {isPublishing && !isRecomputing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Computing...
                      </>
                    ) : isRecomputing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Recomputing...
                      </>
                    ) : (
                      "Compute Model"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="predict">
            <Card className="border-border/50 dark:border-border/20">
              <CardHeader>
                <CardTitle>Life Expectancy Prediction</CardTitle>
                <CardDescription>
                  Enter your health parameters to get a life expectancy
                  prediction
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePredict} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="heartRate">
                        Heart Rate (avg. last 3 days)
                      </Label>
                      <Input
                        id="heartRate"
                        type="number"
                        step="1"
                        min="30"
                        max="300"
                        value={heartRate}
                        onChange={(e) => setHeartRate(e.target.value)}
                        placeholder="e.g., 72"
                        className="border-border/50 dark:border-border/20"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="age">Age</Label>
                      <Input
                        id="age"
                        type="number"
                        step="1"
                        min="1"
                        max="150"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        placeholder="e.g., 45"
                        className="border-border/50 dark:border-border/20"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bloodPressureDiastolic">
                        Blood Pressure (Diastolic)
                      </Label>
                      <Input
                        id="bloodPressureDiastolic"
                        type="number"
                        step="1"
                        min="40"
                        max="200"
                        value={bloodPressureDiastolic}
                        onChange={(e) =>
                          setBloodPressureDiastolic(e.target.value)
                        }
                        placeholder="e.g., 80"
                        className="border-border/50 dark:border-border/20"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bloodPressureSistolic">
                        Blood Pressure (Systolic)
                      </Label>
                      <Input
                        id="bloodPressureSistolic"
                        type="number"
                        step="1"
                        min="70"
                        max="300"
                        value={bloodPressureSistolic}
                        onChange={(e) =>
                          setBloodPressureSistolic(e.target.value)
                        }
                        placeholder="e.g., 120"
                        className="border-border/50 dark:border-border/20"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={
                      isPredicting ||
                      !heartRate ||
                      !bloodPressureDiastolic ||
                      !bloodPressureSistolic ||
                      !age
                    }
                    className="w-full md:w-auto min-w-[120px]"
                  >
                    {isPredicting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Predicting...
                      </>
                    ) : (
                      "Predict Life Expectancy"
                    )}
                  </Button>
                </form>

                {/* Prediction Result */}
                {prediction && (
                  <div className="mt-6 p-6 bg-blue-50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-800/20 rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                        Prediction Result
                      </h3>
                    </div>
                    <div className="bg-white dark:bg-blue-900/10 rounded-md p-4 border border-blue-100/50 dark:border-blue-800/15">
                      <p className="text-lg font-medium text-blue-800 dark:text-blue-200 mb-2">
                        {prediction.message}
                      </p>
                      <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 text-center">
                        {prediction.prediction} years
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
