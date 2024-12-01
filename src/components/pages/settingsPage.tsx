import { initializeSupabase } from "@/services/supabase";
import { useEffect } from "react";
import { Button } from "../ui/button";
import { toast } from "sonner";
import {
  useDrawingSettingsStore,
  useFaceAPIStore,
  useSupabaseConfigStore,
} from "@/services/globalVariables";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Input } from "../ui/input";
import { useSearchParams } from "react-router-dom";

const SettingsPage = () => {
  const {
    supabaseUrl,
    setSupabaseUrl,
    supabaseKey,
    setSupabaseKey,
    supabaseParticipantsTableName,
    setSupabaseParticipantsTableName,
  } = useSupabaseConfigStore();
  const { faceAPILink, setFaceAPILink } = useFaceAPIStore();
  const { category, setCategory } = useDrawingSettingsStore();
  const [searchParams] = useSearchParams();

  const base64Decode = (str: string) => {
    try {
      const decoded = atob(str);
      return decoded;
    } catch (error) {
      console.error("Error decoding base64:", error);
      return str; // Return original string if decoding fails
    }
  };


const setParamIfPresent = (setter: (value: string) => void, paramName: string) => {
  const value = base64Decode(searchParams.get(paramName) || "");
  if (value) {
    setter(value);
  }
};

useEffect(() => {
  setParamIfPresent(setSupabaseUrl, "supabaseUrl");
  setParamIfPresent(setSupabaseKey, "supabaseKey");
  setParamIfPresent(setSupabaseParticipantsTableName, "supabaseParticipantsTableName");
  setParamIfPresent(setFaceAPILink, "faceAPILink");
  setParamIfPresent(setCategory, "category");

  if (supabaseUrl && supabaseKey && supabaseParticipantsTableName) { // Access state directly
    initializeSupabase(supabaseUrl, supabaseKey);
  }
}, [searchParams, supabaseUrl, supabaseKey, supabaseParticipantsTableName]); // Add state variables to dependency array

  const handleSubmitDatabase = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await initializeSupabase(supabaseUrl, supabaseKey);
      toast.success("Supabase initialized successfully!");
    } catch (error) {
      toast.error(`Error initializing Supabase: ${error}`);
    }
  };

  const handleTestFaceAPILink = async () => {
    try {
      // Create a small blank image (1x1 pixel)
      const canvas = document.createElement("canvas");
      canvas.width = 1;
      canvas.height = 1;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "black"; // Fill the canvas with black
        ctx.fillRect(0, 0, 1, 1);
      }
  
      // Convert the canvas to a Blob using a Promise
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((b) => resolve(b), "image/jpeg");
      });
  
      if (!blob) {
        toast.error("Failed to create a dummy image for testing.");
        return;
      }
  
      // Create a File object from the Blob
      const dummyFile = new File([blob], "dummy.jpg", { type: "image/jpeg" });
  
      // Create FormData and append the dummy file
      const formData = new FormData();
      formData.append("file", dummyFile);
  
      // Send the file to the API endpoint
      const response = await fetch(`${faceAPILink}?resize=false`, {
        method: "POST",
        body: formData,
      });
  
      if (response.ok) {
        toast.success("Face API link is working!");
      } else {
        toast.error(`Face API test failed with status ${response.status}`);
      }
    } catch (error) {
      toast.error(`Error testing Face API: ${String(error)}`);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Settings</CardTitle>
        <CardDescription>
          Modify app behaviour
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <form onSubmit={handleSubmitDatabase}>
            <h2 className="font-semibold leading-none tracking-tight text-xl mb-4">
              Database
            </h2>
            <div className="mb-4">
              <label
                htmlFor="url"
                className="block text-muted-foreground mb-2"
              >
                Supabase URL:
              </label>
              <Input
                type="text"
                id="url"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-muted-foreground leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="key"
                className="block text-muted-foreground mb-2"
              >
                Supabase Key:
              </label>
              <Input
                type="text"
                id="key"
                value={supabaseKey}
                onChange={(e) => setSupabaseKey(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-muted-foreground leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="tablename"
                className="block text-muted-foreground mb-2"
              >
                Participants table name:
              </label>
              <Input
                type="text"
                id="tablename"
                value={supabaseParticipantsTableName}
                onChange={(e) =>
                  setSupabaseParticipantsTableName(e.target.value)
                }
                className="shadow appearance-none border rounded w-full py-2 px-3 text-muted-foreground leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <Button type="submit">Initialize Supabase</Button>
          </form>

          <div>
            <h2 className="font-semibold leading-none tracking-tight text-xl mb-4">
              Face scanning
            </h2>
            <div className="mb-4">
              <label
                htmlFor="key"
                className="block text-muted-foreground mb-2"
              >
                Face API link:
              </label>
              <Input
                type="text"
                id="faceAPILink"
                value={faceAPILink}
                onChange={(e) => setFaceAPILink(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-muted-foreground leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <Button
              className="flex"
              onClick={handleTestFaceAPILink}
              type="submit"
            >
              Test Face API Link
            </Button>
          </div>

          <div>
            <h2 className="font-semibold leading-none tracking-tight text-xl mb-4">
              Drawing
            </h2>
            <div className="mb-4">
              <label
                htmlFor="key"
                className="block text-muted-foreground mb-2"
              >
                Draw category filter:
              </label>
              <Input
                type="text"
                id="drawCategoryFilter"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-muted-foreground leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SettingsPage;
