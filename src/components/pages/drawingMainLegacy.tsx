import { Wheel } from "react-custom-roulette";
import { Button } from "@/components/ui/button";
import { RandomName } from "@/components/ui/name-slot-machine";
import {
  getParticipants,
  markParticipantAsWinner,
  getListOfServicelines,
} from "@/services/supabase";
import React, { useEffect, useState } from "react";
import { Participant } from "@/schema/databaseItems";
import { toast } from "sonner";
import LuckyDrawItemBigDisplay from "../ui/lucky-draw-item-big-display";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import BounceInMotionDiv from "../ui/bounce-in-motion-div";
import { usePrizeStore } from "@/services/globalVariables";
import { Prize } from "@/schema/prizesSchema";

interface Props {}

const SPINDURATION = 5000;
// TODO Undo for draw

// Pick a random item in an array, returns item only
const pickRandomWinner = (listOfParticipants: Participant[]): Participant => {
  const winner =
    listOfParticipants[
      Math.floor(Math.random() * (listOfParticipants.length - 0 + 1))
    ];
  return winner;
};

const DrawingMainLegacy: React.FC<Props> = () => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [servicelines, setListOfServicelines] = useState<string[]>([]);
  const [winningServiceline, setWinningServiceline] = useState<string>("");
  const [transitionDuration, setTransitionDuration] = React.useState(10);
  const [currentPrizeToBeGiven, setCurrentPrizeToBeGiven] =
    React.useState<Prize>();

  const [chosenWinner, setChosenWinner] = useState<Participant>();
  const [nameSlotMachineList, setNameSlotMachineList] = useState<Participant[]>(
    []
  );

  const { prizes, setPrizes } = usePrizeStore();

  // States of view
  const [showItemToBeWon, setShowItemToBeWon] = useState(true);
  const [showWheel, setShowWheel] = useState(false);
  const [showPerson, setShowPerson] = useState(false);

  const [showSlotMachineWinner, setShowSlotMachineWinner] =
    React.useState(false);
  const [mustSpin, setMustSpin] = useState(false);
  const [wheelChoice, setWheelChoice] = useState(0);

  // Get the list of available service lines upon showing the drawing page
  useEffect(() => {
    getListOfServicelines()
      .then((listOfServicelines) => {
        const withOutNulls = listOfServicelines.filter(
          (serviceline) => serviceline !== null
        );
        setListOfServicelines(withOutNulls);
      })
      .catch((error) => toast(error));
  }, []);

  useEffect(() => {
    setCurrentPrizeToBeGiven(getNextAvailablePrize(prizes));
  }, [prizes]);

  const drawAndShowSlotMachineWinner = async () => {
    // Start the slot machine to show the winner
    setShowSlotMachineWinner(false);

    // Choose a winner from the list of valid participants
    const chosenWinner = pickRandomWinner(participants);
    setChosenWinner(chosenWinner);

    // Filter out all the non winners from the list of valid participants this round
    const losers = participants.filter(
      (participant) => participant.id !== chosenWinner.id
    );

    // Set the list of people to be shown in the slot machine
    setNameSlotMachineList([chosenWinner, ...losers]);

    // Start the slot machine to show the winner
    setShowSlotMachineWinner(true);
  };

  const drawWinningServiceline = async () => {
    // Choose a service line to draw the winner from
    const indexOfServlicelineChosen = Math.floor(
      Math.random() * servicelines.length
    );

    // Get the list of participants for the chosen service line
    const validParticipants = await getParticipants({
      serviceline: servicelines[indexOfServlicelineChosen],
    });
    setWinningServiceline(servicelines[indexOfServlicelineChosen]);
    setParticipants(validParticipants);
    console.log("participants", validParticipants);

    // Show the spinner for the serviceline chosen
    if (!mustSpin) {
      setWheelChoice(indexOfServlicelineChosen);
      setMustSpin(true);
    }
  };

  const getNextAvailablePrize = (prizes: Prize[]): Prize | undefined => {
    // Find the prize with the highest prizeNumber which is still available
    let highestPrizeNumber = 0;
    let highestPrize: Prize | undefined = undefined;

    for (const prize of prizes) {
      if (
        prize.prizeNumber > highestPrizeNumber &&
        prize.given < prize.quantity
      ) {
        highestPrizeNumber = prize.prizeNumber;
        highestPrize = prize;
      }
    }
    return highestPrize;
  };

  const incrementPrizeGiven = async (
    prizeNumber: number = 0,
    numberToIncrement: number = 1
  ) => {
    if (prizeNumber === 0) {
      prizeNumber = currentPrizeToBeGiven?.prizeNumber || 0;
    }

    const prizeToIncrementGivenValue = prizes.filter(
      (prize) => prize.prizeNumber == prizeNumber
    )[0];
    const otherPrizes = prizes.filter(
      (prize) => prize.prizeNumber != prizeNumber
    );
    prizeToIncrementGivenValue.given =
      Number(prizeToIncrementGivenValue.given) + numberToIncrement;
    const newPrizes = [prizeToIncrementGivenValue, ...otherPrizes];
    newPrizes.sort((a, b) => a.prizeNumber - b.prizeNumber);
    setPrizes(newPrizes);
    toast.success(
      `
      ${Number(prizeToIncrementGivenValue.given)} of
      ${Number(prizeToIncrementGivenValue.quantity)} ${
        prizeToIncrementGivenValue.prizeName
      }s given!`
    );
  };

  const handleMarkWinnerOnServer = () => {
    if (!chosenWinner) {
      toast.warning("No chosen winner yet");
      return;
    }

    const winnerId = chosenWinner.id;
    if (currentPrizeToBeGiven == undefined) {
      toast.error(
        `Error marking ${chosenWinner.name} as a winner: Prize won is null`
      );
      return;
    }
    markParticipantAsWinner(winnerId, currentPrizeToBeGiven.prizeNumber)
      .then(() => {
        incrementPrizeGiven();
        toast.success(`${chosenWinner.name} marked as a winner!`);
      })
      .catch((error) => {
        toast.error(`Error marking ${chosenWinner.name} as a winner: ${error}`);
      });
    return;
  };

  const handleUndoWinnerOnServer = () => {
    if (!chosenWinner) {
      toast.warning("No chosen winner yet");
      return;
    }

    const winnerId = chosenWinner.id;

    markParticipantAsWinner(winnerId, null)
      .then(() => {
        incrementPrizeGiven(0, -1);
        toast.success(`${chosenWinner.name} unmarked as a winner!`);
      })
      .catch((error) => {
        toast.error(`Error undoing ${chosenWinner.name} as a winner: ${error}`);
      });
  };

  const testing = () => {
    console.log("servicelines", servicelines);
    const x = servicelines.map((line) => ({
      option: line.charAt(0).toUpperCase() + line.slice(1),
    }));

    console.log("x", x);
  };

  return (
    <div className="h-full w-full">
      {/* First page: Show the item to be won */}
      {showItemToBeWon && (
        <BounceInMotionDiv className="h-full w-full flex items-center justify-center">
          <LuckyDrawItemBigDisplay
            imgLink={
              currentPrizeToBeGiven ? currentPrizeToBeGiven.imageLink : ""
            }
            title={
              currentPrizeToBeGiven
                ? currentPrizeToBeGiven.prizeName
                : "Loading"
            }
            desc={
              currentPrizeToBeGiven
                ? currentPrizeToBeGiven.description
                : "Loading"
            }
          />
          <Button
            size="icon"
            className="absolute bottom-5 right-5"
            onClick={() => {
              setShowItemToBeWon(false);
              setShowWheel(true);
            }}
          >
            <ChevronRightIcon />
          </Button>
        </BounceInMotionDiv>
      )}
      {/* Second page: Show spinner for servicelines */}
      {showWheel && (
        <BounceInMotionDiv className="h-full w-full flex items-center justify-center">
          <Button
            size="icon"
            className="absolute bottom-5 left-5"
            variant="ghost"
            onClick={() => {
              setShowItemToBeWon(true);
              setShowWheel(false);
            }}
          >
            <ChevronLeftIcon />
          </Button>
          <Wheel
            spinDuration={SPINDURATION / 10000}
            mustStartSpinning={mustSpin}
            prizeNumber={wheelChoice}
            data={
              servicelines.length > 0
                ? servicelines.map((line) => ({
                    option: line.charAt(0).toUpperCase() + line.slice(1),
                  }))
                : [{ option: "Loading" }]
            } // Map to wheel options, uppercase first letter
            onStopSpinning={() => {
              setMustSpin(false);
            }}
          />
          <Button onClick={() => drawWinningServiceline()}>
            Draw service line
          </Button>
          <Button onClick={() => incrementPrizeGiven()}>test</Button>
          <Button
            size="icon"
            className="absolute bottom-5 right-5"
            onClick={() => {
              setShowWheel(false);
              setShowPerson(true);
            }}
          >
            <ChevronRightIcon />
          </Button>
        </BounceInMotionDiv>
      )}
      {/* Last page: Draw the winner from a list of valid participants from a serviceline */}
      {showPerson && (
        <BounceInMotionDiv className="h-full w-full flex items-center justify-center">
          <Button
            size="icon"
            className="absolute bottom-5 left-5"
            variant="ghost"
            onClick={() => {
              setShowWheel(true);
              setShowPerson(false);
            }}
          >
            <ChevronLeftIcon />
          </Button>
          <div className="card">
            <div className="text-3xl">Da winner</div>
            {showSlotMachineWinner ? (
              <Button
                onClick={() => setShowSlotMachineWinner(false)}
              >
                Reset
              </Button>
            ) : (
              <Button onClick={() => drawAndShowSlotMachineWinner()}>
                Draw a Winner
              </Button>
            )}
            {showSlotMachineWinner && (
              <div>
                <Button onClick={() => handleMarkWinnerOnServer()}>
                  Mark winner on server
                </Button>
                <Button onClick={() => handleUndoWinnerOnServer()}>
                  Undo winner on server
                </Button>
              </div>
            )}
          </div>

          <div className="App">
            <div>
              <RandomName
                names={nameSlotMachineList.map(
                  (participant) => participant.name
                )}
                showWinner={showSlotMachineWinner}
                transitionDuration={transitionDuration}
              />
            </div>
          </div>
          <Button
            size="icon"
            className="absolute bottom-5 right-5"
            onClick={() => {
              setShowPerson(false);
              setShowItemToBeWon(true);
            }}
          >
            <ChevronRightIcon />
          </Button>
        </BounceInMotionDiv>
      )}
    </div>
  );
};

export default DrawingMainLegacy;
