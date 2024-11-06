import { handleCheckIn } from "@/services/supabase";
import React, { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFaceAPIStore } from "@/services/globalVariables";
import { toast } from "sonner";
import { Card, CardContent, CardHeader } from "../ui/card";

interface Props {}

const ACCURACY = 3;
const RETRY_MAX = 15;

const delay = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const CheckIn: React.FC<Props> = () => {
  const { faceAPILink } = useFaceAPIStore();
  const [ids, setIds] = useState<string[]>([]);
  const webcamRef = useRef<Webcam>(null);
  // const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [idCounts, setIdCounts] = useState<Record<string, number>>({
    _resting: ACCURACY,
  }); // defaulted to something so that it doesn't start sending requests on startup
  const [mostLikelyToBePerson, setMostLikelyToBePerson] =
    useState<string>("_resting");
  const [manualEntryUITextBox, setManualEntryUITextBox] = useState<string>("");
  const [retryCount, setRetryCount] = useState<number>(0);

  // useEffect(() => {
  //   if (serverPort) {
  //     const newIntervalId = setInterval(capture, 2500);
  //     setIntervalId(newIntervalId);
  //     return () => clearInterval(newIntervalId);
  //   }
  //   return () => {
  //     if (intervalId) {
  //       clearInterval(intervalId);
  //     }
  //   };
  // }, [serverPort]);

  // const captureFrames = async () => {
  //   for (let i = 0; i < 10; i++) {
  //     await delay(750);
  //     await capture();
  //   }
  // };

  // Main face scanning loop
  // Whenever "beginFacialRecognition" is used, "ids" would change, prompting this useEffect loop to start
  // The loop checks if any Id has been in the top position 5 times or more, stops the loop if true
  // If not it'll call capture again after a 750ms delay, sendImage will inevitably "set" ids again causing this loop to repeat
  useEffect(() => {
    if (ids.length > 0) {
      idCounts[ids[0]] = idCounts[ids[0]] ? idCounts[ids[0]] + 1 : 1;
    }
    const checkEachIdLoop = async () => {
      let thresholdMet = false;
      for (const key in idCounts) {
        if (idCounts[key] >= ACCURACY) {
          console.log(`Person is likely ${key}`);
          setMostLikelyToBePerson(key);
          thresholdMet = true;
        }
      }
      if (!thresholdMet && retryCount < RETRY_MAX) {
        setRetryCount(retryCount + 1);
        await delay(500);
        await capture();
      } else if (retryCount >= RETRY_MAX) {
        setMostLikelyToBePerson("_unidentifiable");
      }
    };
    checkEachIdLoop();
  }, [ids]);

  const beginFacialRecognition = () => {
    setIdCounts({});
    setMostLikelyToBePerson("_loading");
    setRetryCount(0);
    setManualEntryUITextBox("");
    capture();
  };

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
      console.log("API Response:", data);
      return data.potential_ids;
    } catch (error) {
      console.error("Error sending image:", error);
      toast.error(`Error sending image: ${String(error)}`);
      return null;
    }
  };

  const manualEntryUI = () => {
    return (
      <div className="flex flex-col gap-2">
        <p>Please enter your staff ID manually or request for assistance:</p>
        <div className="flex flex-row gap-2">
          <Input
            type="text"
            value={manualEntryUITextBox}
            onChange={(e) => setManualEntryUITextBox(e.target.value)}
            placeholder="Enter id"
          />
          <Button onClick={() => handleCheckIn(manualEntryUITextBox)}>
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
    switch (mostLikelyToBePerson) {
      case "_resting":
        return;
      case "_loading":
        return <p>Loading</p>;
      case "_unidentifiable":
        return (
          <>
            <p>Unfortunately, I can't identify you.</p>
            {manualEntryUI()}
          </>
        );
      default:
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
          {mostLikelyToBePerson !== "_loading" && (
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
