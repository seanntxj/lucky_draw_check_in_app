import React from "react";
import { Card } from "./card";
import { shuffle } from "@/lib/utils";

interface NameSlotMachineProps {
  names: string[]; // Specify type as array of strings representing all the NON winning participants
  showWinner: boolean; // To start the animation for showing the winner
  transitionDuration: number; // Animation speed in seconds
}

/**
 * Name slot machine component
 * Use like so: 
 * <RandomName
    names={[<winner>, ...<participants>]}
    showWinner={showWinner}
    transitionDuration={transitionDuration}
   />
 * @param 
 * @returns 
 */
export const RandomName: React.FC<NameSlotMachineProps> = (
  props: NameSlotMachineProps
) => {
  const { names = [], showWinner = false, transitionDuration = 10 } = props;

  let shuffledNames: string[] =[]
  if (names.length > 0) {
    shuffledNames = [names[0], ...shuffle(names)]
  }

  const getNameContainerStyles = (): React.CSSProperties => {
    if (showWinner) {
      return {
        opacity: 1,
        transform: `translateY(0%)`,
        transition: `transform ${transitionDuration}s cubic-bezier(0.075, 0.82, 0.7, 1), opacity ${
          transitionDuration * 0.1
        }s ease-out`,
      };
    }
    return {
      opacity: 0,
      transform: "translateY(-100%)",
      transition: "none",
    };
  };

  return (
    <Card className="overflow-hidden h-[90vh] w-full flex items-center justify-center">
      <div className="h-[400px] w-max overflow-hidden [mask-image:radial-gradient(ellipse_90%_95%,#000_5%,transparent_50%)]">
        <div
          className="text-center text-ellipsis text-9xl"
          style={getNameContainerStyles()}
        >
          {shuffledNames.map((n, i) => (
            <div key={i + n} className="p-36 font-bold font-serif">
              {n.length > 20 ? n.substring(0, 20) + "..." : n}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default RandomName;
