import { handleCheckIn } from "@/services/supabase";
import React, { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFaceAPIStore } from "@/services/globalVariables";
import { toast } from "sonner";
import { Card, CardContent, CardHeader } from "../ui/card";
import { bouncy } from "ldrs";

interface Props {}

const ACCURACY = 3;
const RETRY_MAX = 15;

const CheckIn: React.FC<Props> = () => {
  const { faceAPILink } = useFaceAPIStore();
  const [ids, setIds] = useState<string[]>([]);
  const [idCounts, setIdCounts] = useState<Record<string, number>>({});

  const webcamRef = useRef<Webcam>(null);
  const [checkInState, setCheckInState] = useState<
    "resting" | "loading" | "failed" | "success"
  >("resting");
  const [mostLikelyToBePerson, setMostLikelyToBePerson] = useState<string>("");
  const [retryCount, setRetryCount] = useState<number>(0);
  const [manualEntryUITextBox, setManualEntryUITextBox] = useState<string>("");
  bouncy.register();

  // Captures an image, sends it to the server, and then returns the response into ids, ordered from most likely to least likely persons ids
  const capture = async (): Promise<string[] | null> => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      const img = new Image();
      img.src = imageSrc;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 1280;
        canvas.height = 900;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, 640, 480);
          const resizedImageSrc = canvas.toDataURL("image/jpeg");
          console.log("resized image src:", resizedImageSrc);
          sendImage(resizedImageSrc);
        } else {
          console.error("Could not get 2D rendering context");
        }
      };
    } else {
      console.log("Webcam not available or not ready yet.");
    }
    return null;
  };

  // Sends the image to the server and returns the response
  const sendImage = async (imageSrc: string): Promise<string[] | null> => {
    try {
      const response = await fetch(faceAPILink, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: imageSrc }),
      });
      const data = await response.json();
      setIds(data.potential_ids);
      // console.log("API Response:", data);
      return data.potential_ids;
    } catch (error) {
      console.error("Error sending image:", error);
      toast.error(`Error sending image: ${String(error)}`);
      return null;
    }
  };

  // Begin the loop for facial recognition
  const beginFacialRecognition = async () => {
    setIdCounts({});
    setRetryCount(0);
    setManualEntryUITextBox("");
    setCheckInState("loading");
    setMostLikelyToBePerson("");
    capture();
  };

  // Triggered when the user uses beginFacialRecognition as ids will be updated from capture();
  useEffect(() => {
    // If the server has returned some ids
    // Take the first ids and increment its count by one
    if (ids.length > 0) {
      idCounts[ids[0]] = idCounts[ids[0]] ? idCounts[ids[0]] + 1 : 1;
    }
    // Check if any Ids have a count more than the threshold, ACCURACY
    // If they do, end the loop and show the most likely person
    // If not, increment the retry count and call capture() again, which would update Ids, which would in turn trigger this useEffect again
    const doAsyncStuff = async () => {
      for (const key in idCounts) {
        if (idCounts[key] >= ACCURACY) {
          setMostLikelyToBePerson(key);
          setCheckInState("success");
          return;
        }
      }
      if (retryCount < RETRY_MAX) {
        setRetryCount(retryCount + 1);
      } else if (retryCount >= RETRY_MAX) {
        setCheckInState("failed");
        return;
      }
      capture();
    };
    doAsyncStuff();
  }, [ids]);

  const manualEntryUI = () => {
    return (
      <div className="flex flex-col gap-2">
        <p>Please enter your staff ID manually or request for assistance</p>
        <div className="flex flex-row gap-2">
          <Input
            type="text"
            value={manualEntryUITextBox}
            onChange={(e) => setManualEntryUITextBox(e.target.value)}
            placeholder="Enter id"
          />
          <Button onClick={() => handleCheckIn(manualEntryUITextBox, false)}>
            Check in
          </Button>
        </div>
      </div>
    );
  };

  const getListOfPossiblePersonsExcept = (
    idCounts: Record<string, number>,
    mostLikelyToBePerson: string
  ) => {
    const listOfPossiblePersonsExcept = [];
    for (const key in idCounts) {
      if (key !== mostLikelyToBePerson) {
        listOfPossiblePersonsExcept.push(key);
      }
    }
    console.log("listOfPossiblePersonsExcept:", listOfPossiblePersonsExcept);
    return listOfPossiblePersonsExcept;
  };

  const personSelection = () => {
    switch (checkInState) {
      case "resting":
        return;
      case "loading":
        return <l-bouncy size="45" speed="1.75" color="gray" />;
      case "failed":
        return (
          <>
            <p>Unfortunately, I can't identify you.</p>
            {manualEntryUI()}
          </>
        );
      default: // has identified a person.
        return (
          <div>
            <p>Hi, {mostLikelyToBePerson}!</p>
            <Button onClick={() => handleCheckIn(mostLikelyToBePerson)}>
              Check in
            </Button>
            <p>Not you?</p>
            {
              <>
                {[
                  ...getListOfPossiblePersonsExcept(
                    idCounts,
                    mostLikelyToBePerson
                  ),
                ].map((person) => (
                  <Button onClick={() => handleCheckIn(person)} key={person}>
                    {person}
                  </Button>
                ))}
                {manualEntryUI()}
              </>
            }
          </div>
        );
    }
  };

  return (
    <>
      <Card>
        <CardHeader />
        <CardContent className="flex flex-col items-center justify-center gap-4">
          <div className="rounded-lg overflow-hidden w-[400px] h-[300px]">
            <Webcam ref={webcamRef} screenshotFormat="image/jpeg" />
          </div>
          {checkInState !== "loading" && (
            <button
              onClick={beginFacialRecognition}
              className="p-[3px] relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg" />
              <div className="px-8 py-2 bg-black rounded-[6px]  relative group transition duration-200 text-white hover:bg-transparent">
                Begin Check In
              </div>
            </button>
          )}
          {personSelection()}
        </CardContent>
      </Card>
    </>
  );
};

export default CheckIn;
