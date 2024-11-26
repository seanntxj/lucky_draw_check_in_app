import { Button } from "@/components/ui/button";
import { RandomName } from "@/components/ui/name-slot-machine";
import { getParticipants, markParticipantAsWinner } from "@/services/supabase";
import React, { useEffect, useState } from "react";
import { Participant } from "@/schema/databaseItems";
import { toast } from "sonner";
import LuckyDrawItemBigDisplay from "../ui/lucky-draw-item-big-display";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import BounceInMotionDiv from "../ui/bounce-in-motion-div";
import {
  useDrawingSettingsStore,
  usePrizeStore,
} from "@/services/globalVariables";
import { Prize } from "@/schema/prizesSchema";
import ConfettiExplosion from "react-confetti-explosion";

interface Props {}

// Pick a random item in an array, returns item only
const pickRandomWinner = (listOfParticipants: Participant[]): Participant => {
  const winner =
    listOfParticipants[
      Math.floor(Math.random() * (listOfParticipants.length - 0 + 1))
    ];
  return winner;
};

const DrawingMain: React.FC<Props> = () => {
  const [transitionDuration] = React.useState(10);
  const [currentPrizeToBeGiven, setCurrentPrizeToBeGiven] =
    React.useState<Prize>();

  const [chosenWinner, setChosenWinner] = useState<Participant>();
  const [nameSlotMachineList, setNameSlotMachineList] = useState<Participant[]>(
    []
  );
  const [isConfettiShowing, setIsConfettiShowing] = React.useState(false);

  const { prizes, setPrizes } = usePrizeStore();
  const { category } = useDrawingSettingsStore();

  // States of view
  const [showItemToBeWon, setShowItemToBeWon] = useState(true);
  const [showPerson, setShowPerson] = useState(false);
  const [showSlotMachineWinner, setShowSlotMachineWinner] =
    React.useState(false);

  useEffect(() => {
    setCurrentPrizeToBeGiven(getNextAvailablePrize(prizes));
  }, [prizes]);

  const useConfettiAfterRevealName = async () => {
    await new Promise((resolve) => setTimeout(resolve, 10000));
    setIsConfettiShowing(true);
    await new Promise((resolve) => setTimeout(resolve, 4000)); // Ensure the confetti isn't hidden before animation ends.
    setIsConfettiShowing(false);
  };

  const drawAndShowSlotMachineWinner = async () => {
    // Reset the slot machine to the beginning state
    setShowSlotMachineWinner(false);

    // Get a list of valid participants
    const participants = await getParticipants({ category: category });
    if (participants.length === 0) {
      toast.error(
        `Can't get any participants. Ensure there's at least one participant that has registered.`
      );
      return;
    }

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
    useConfettiAfterRevealName();
  };

  const getNextAvailablePrize = (prizes: Prize[]): Prize => {
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
    return highestPrize || prizes[0];
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

    markParticipantAsWinner(winnerId, null, false)
      .then(() => {
        toast.success(`${chosenWinner.name} unmarked as a winner!`);
      })
      .catch((error) => {
        toast.error(`Error undoing ${chosenWinner.name} as a winner: ${error}`);
      });
  };

  return (
    <div className="h-full w-full">
      {/* Confetti */}
      <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2">
        {isConfettiShowing && (
          <ConfettiExplosion
            particleCount={250}
            force={0.8}
            duration={4000}
            width={1600}
          />
        )}
      </div>
      {/* First page: Show the item to be won */}
      {showItemToBeWon && (
        <BounceInMotionDiv className="h-full w-full">
          <Button
            size="icon"
            className="absolute bottom-5 left-5"
            variant={"outline"}
            onClick={() => {
              incrementPrizeGiven(currentPrizeToBeGiven?.prizeNumber, -1);
            }}
          >
            <ChevronLeftIcon />
          </Button>
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
              setShowPerson(true);
            }}
          >
            <ChevronRightIcon />
          </Button>
        </BounceInMotionDiv>
      )}
      {/* Draw the winner from a list of valid participants */}
      {showPerson && (
        <BounceInMotionDiv className="h-full w-full flex items-center justify-center">
          <Button
            size="icon"
            className="absolute bottom-5 left-5"
            variant="ghost"
            onClick={() => {
              setShowItemToBeWon(true);
              setShowPerson(false);
            }}
          >
            <ChevronLeftIcon />
          </Button>

          <RandomName
            names={nameSlotMachineList.map((participant) => participant.name)}
            showWinner={showSlotMachineWinner}
            transitionDuration={transitionDuration}
          />

          <div className="flex gap-4 absolute bottom-5">
            {showSlotMachineWinner ? (
              <Button onClick={() => setShowSlotMachineWinner(false)}>
                Reset
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => drawAndShowSlotMachineWinner()}
              >
                Draw a Winner
              </Button>
            )}
            {showSlotMachineWinner && (
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() => handleMarkWinnerOnServer()}
                >
                  Mark winner on server
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => handleUndoWinnerOnServer()}
                >
                  Undo winner on server
                </Button>
              </div>
            )}
          </div>

          <Button
            size="icon"
            className="absolute bottom-5 right-5"
            onClick={() => {
              setShowPerson(false);
              setShowItemToBeWon(true);
              setShowSlotMachineWinner(false);
              incrementPrizeGiven();
            }}
          >
            <ChevronRightIcon />
          </Button>
        </BounceInMotionDiv>
      )}
    </div>
  );
};

export default DrawingMain;
