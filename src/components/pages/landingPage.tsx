import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download } from "lucide-react";
import { toast } from "sonner";

import { useState } from "react";
import Papa from "papaparse";
import { usePrizeStore } from "@/services/globalVariables";
import { Link, useNavigate } from "react-router-dom";

export function CardWithForm() {
  const [file, setFile] = useState<File | null>(null); // Use File type
  const prizes = usePrizeStore((state) => state.prizes);
  const navigate = useNavigate();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log(event);
    const selectedFile = event.target.files?.[0] || null; // Safely access the first file
    selectedFile !== null ? setFile(selectedFile) : ""; // Update state with the selected file
  };

  const handleOnClickUseCSV = () => {
    if (file) {
      console.log(file);
      Papa.parse(file, {
        complete: function (results: { data: any }) {
          console.log("Finished:", results.data);
          const formattedPrizes = results.data
            .slice(1) // Start from the second object
            .filter((item: string | any[]) => item.length > 1) // Exclude empty or null rows
            .map((item: any[]) => ({
              prizeNumber: Number(item[0]),
              prizeName: item[1],
              quantity: Number(item[2]),
              given: Number(item[3]),
              description: item[4],
              imageLink: item[5],
            }));
          usePrizeStore.getState().setPrizes(formattedPrizes);
          navigate("/dashboard");
        },
      });
    }
  };

  return (
    <div className="h-full w-full flex flex-col gap-4">
      <div className="pl-2">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink>Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            {prizes.length > 0 && (
              <BreadcrumbLink asChild>
                <Link to="/dashboard">Dashboard</Link>
              </BreadcrumbLink>
            )}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="h-full w-full flex justify-center items-center">
        <Card>
          <CardHeader>
            <CardTitle>Upload prizes CSV</CardTitle>
            <CardDescription>
              Upload a csv file containing all the prizes to be won!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form>
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="file">File</Label>
                  <Input
                    id="csv"
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange} // Attach the change handler
                  />
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() =>
                // TODO Store in storage bucket
                window.open("https://www.google.com", "_blank")
              }
            >
              <div className="flex items-center gap-2">
                <span>Sample</span>
                <Download className="h-4 w-4" />
              </div>
            </Button>

            {file ? (
              <Button onClick={handleOnClickUseCSV}>Use CSV</Button>
            ) : (
              <Button
                onClick={() =>
                  toast.warning("Start from scratch not yet implemented")
                }
                variant={"secondary"}
              >
                Start
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

interface Props {}

const LandingPage: React.FC<Props> = () => {
  return <CardWithForm />;
};

export default LandingPage;
