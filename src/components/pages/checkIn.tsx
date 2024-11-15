import { handleCheckIn } from "@/services/supabase";
import React, { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFaceAPIStore } from "@/services/globalVariables";
import { toast } from "sonner";
import { Card, CardContent, CardHeader } from "../ui/card";
import { FlipWords } from "../ui/flip-words";
import { motion } from "framer-motion";
import { SpringModal } from "../ui/spring-modal";
import BounceInMotionDiv from "../ui/bounce-in-motion-div";
import { ArrowLeftIcon } from "lucide-react";

interface Props {}

const ACCURACY = 3;
const RETRY_MAX = 20;

const CheckIn: React.FC<Props> = () => {
  const { faceAPILink } = useFaceAPIStore();
  const [ids, setIds] = useState<string[]>([]);
  const [idCounts, setIdCounts] = useState<Record<string, number>>({});
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(true);
  const [showAlternativePeople, setShowAlternativePeople] = useState(false);

  const webcamRef = useRef<Webcam>(null);
  const [checkInState, setCheckInState] = useState<
    "resting" | "loading" | "failed" | "success"
  >("resting");
  const [mostLikelyToBePerson, setMostLikelyToBePerson] = useState<string>("");
  const [retryCount, setRetryCount] = useState<number>(0);
  const [manualEntryUITextBox, setManualEntryUITextBox] = useState<string>("");

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
    setShowAlternativePeople(false);
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
        return (
          <motion.div
            initial={{ opacity: 0, filter: "blur(5px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            transition={{
              duration: 0.5, // Adjust duration as needed
              ease: "easeInOut", // Adjust easing function as needed
            }}
          >
            <button
              onClick={beginFacialRecognition}
              className="p-[3px] relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg" />
              <div className="px-8 py-2 bg-black rounded-[6px]  relative group transition duration-200 text-white hover:bg-transparent">
                Begin Facial Recognition
              </div>
            </button>{" "}
          </motion.div>
        );
      case "loading":
        return (
          <motion.div
            initial={{ opacity: 0, filter: "blur(5px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            transition={{
              duration: 0.5, // Adjust duration as needed
              ease: "easeInOut", // Adjust easing function as needed
            }}
          >
            <FlipWords
              words={[
                "Ready?",
                "Smile!",
                "Ensure you are facing the camera straight",
                "Stand arms length away from the camera",
                "This is taking longer than usual",
                "Its not you, its me!",
                "This thing hasn't timed out yet?",
                "Man I'm running out of things to say",
                "So urm, lovely weather we're having today..",
                "..or night hah! Get it? Because it's a night event?",
                "This is getting awkward...",
              ]}
            />
          </motion.div>
        );
      case "failed":
        return (
          <motion.div
            initial={{ opacity: 0, filter: "blur(5px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            transition={{
              duration: 0.5, // Adjust duration as needed
              ease: "easeInOut", // Adjust easing function as needed
            }}
          >
            <p>Unfortunately, I can't identify you.</p>
            {manualEntryUI()}
          </motion.div>
        );
      default: // has identified a person.
        return successfulFaceScanUI();
    }
  };

  const successfulFaceScanUI = () => {
    return (
      <div className="flex flex-col gap-4">
        <SpringModal
          isOpen={isSuccessModalOpen}
          setIsOpen={setIsSuccessModalOpen}
        >
          <>
            {!showAlternativePeople && (
              <BounceInMotionDiv className="flex flex-col gap-4">
                <div>
                  <h4 className="text-lg md:text-3xl text-neutral-600 dark:text-neutral-100 font-bold text-center">
                    Hi, {mostLikelyToBePerson.split("+")[1]}
                  </h4>
                  <h3 className="text-lg md:text-2xl text-neutral-600 dark:text-neutral-100 font-bold text-center mt-2">
                    Enjoy your time and{" "}
                    <span className="px-1 py-0.5 rounded-md bg-opacity-50 bg-gray-300 dark:bg-neutral-800 dark:border-neutral-700 border border-gray-200">
                      good luck! 🌟
                    </span>
                  </h3>
                </div>
                <div className="flex justify-center gap-1 pt-10">
                  <Button
                    onClick={() => setShowAlternativePeople(true)}
                    variant="secondary"
                    className="px-10 py-5"
                  >
                    Not you?
                  </Button>
                  <Button
                    onClick={async () => {
                      const res = await handleCheckIn(
                        mostLikelyToBePerson.split("+")[0],
                        true,
                        true,
                        false
                      );

                      if (res) {
                        setCheckInState("resting");
                      }
                    }}
                    className="px-10 py-5"
                  >
                    Check in
                  </Button>
                </div>
              </BounceInMotionDiv>
            )}
            {showAlternativePeople && (
              <BounceInMotionDiv className="flex flex-col gap-4">
                <div>
                  <Button
                    variant={"secondary"}
                    onClick={() => setShowAlternativePeople(false)}
                  >
                    <ArrowLeftIcon />
                  </Button>
                </div>
                <div className="flex flex-col gap-4">
                  {getListOfPossiblePersonsExcept(
                    idCounts,
                    mostLikelyToBePerson
                  ).length !== 0 && (
                    <div >
                      <h4 className="text-lg md:text-2xl text-neutral-600 dark:text-neutral-100 font-bold text-center mb-4">
                        Are you perhaps...
                      </h4>
                      <div className="flex justify-center gap-4">
                      {[
                        ...getListOfPossiblePersonsExcept(
                          idCounts,
                          mostLikelyToBePerson
                        ),
                      ].map((person) => (
                        <Button
                          onClick={() => handleCheckIn(person.split("+")[0])}
                          key={person}
                        >
                          {person.split("+")[1]}
                        </Button>
                      ))}
                        </div>
                    </div>
                  )}
                  <Button onClick={beginFacialRecognition} variant={"outline"} className="text-black dark:text-white">
                    Retry Face Scan
                  </Button>
                </div>
              </BounceInMotionDiv>
            )}
          </>
        </SpringModal>
      </div>
    );
  };

  return (
    <>
      <Card>
        <CardHeader />
        <CardContent className="flex flex-col items-center justify-center gap-4">
          <div className="rounded-lg overflow-hidden  z-50">
            <Webcam ref={webcamRef} screenshotFormat="image/jpeg" />
          </div>
          {personSelection()}
        </CardContent>
      </Card>
    </>
  );
};

export default CheckIn;
