import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CheckCheckIcon } from "lucide-react";
import { handleCheckIn } from "@/services/supabase";
import { useState } from "react";
import { CrossCircledIcon } from "@radix-ui/react-icons";

interface Props {}
const ManualCheckInPage: React.FC<Props> = () => {
  const [currentSearchTerm, setCurrentSearchTerm] = useState<string>('');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manual check in</CardTitle>
        <CardDescription>
          Insert your employee ID to manually check-in.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex w-[75%]">
          <Input value={currentSearchTerm} onChange={e => setCurrentSearchTerm(e.target.value)} />
          <Button onClick={() => handleCheckIn(currentSearchTerm, false, true)}>
            <CheckCheckIcon />
          </Button>
          <Button variant={"destructive"} onClick={() => handleCheckIn(currentSearchTerm, false, false)}>
            <CrossCircledIcon/>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ManualCheckInPage;
