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
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Table,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ChevronRightIcon } from "@radix-ui/react-icons";

import { usePrizeStore } from "@/services/globalVariables";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Label } from "@radix-ui/react-label";
import { Input } from "../ui/input";

interface Props {}

const PrizesAdminDashboard: React.FC<Props> = () => {
  const { prizes } = usePrizeStore();
  // console.log(prizes);

  return (
    <div className="h-full w-full flex flex-col gap-4">
      <div className="pl-2">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <Link to="/">Home</Link>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            {prizes.length > 0 && (
              <BreadcrumbLink asChild>
                <div>Dashboard</div>
              </BreadcrumbLink>
            )}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <Card x-chunk="dashboard-06-chunk-0">
        <CardHeader>
          <CardTitle>Lucky draw items</CardTitle>
          <CardDescription>
            Preview lucky draw items.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4 h-full overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="hidden w-[100px] sm:table-cell">
                    <span className="sr-only">img</span>
                  </TableHead>
                  <TableHead>Prize Number</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Quantity
                  </TableHead>
                  <TableHead className="hidden md:table-cell">Given</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Description
                  </TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {prizes.map((prize) => (
                  <TableRow onClick={() => console.log("yee")}>
                    <Dialog>
                      <DialogTrigger>
                        <TableCell className="hidden sm:table-cell">
                          {prize.imageLink && (
                            <img
                              className="aspect-square rounded-md object-cover"
                              height="64"
                              src={prize.imageLink}
                              width="64"
                            />
                          )}
                        </TableCell>
                      </DialogTrigger>
                      <DialogContent className="absolute sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Edit profile</DialogTitle>
                          <DialogDescription>
                            Make changes to your profile here. Click save when
                            you're done.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                              Name
                            </Label>
                            <Input
                              id="name"
                              defaultValue="Pedro Duarte"
                              className="col-span-3"
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="username" className="text-right">
                              Username
                            </Label>
                            <Input
                              id="username"
                              defaultValue="@peduarte"
                              className="col-span-3"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button type="submit">Save changes</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <TableCell className="font-medium">
                      {prize.prizeNumber}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {prize.prizeName}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{prize.quantity}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{prize.given}</Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {prize.description}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-xs text-muted-foreground">
            Showing <strong>1-{prizes.length}</strong> of{" "}
            <strong>{prizes.length}</strong> prizes
          </div>
          <Link to="/draw">
            <Button size="icon">
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PrizesAdminDashboard;
