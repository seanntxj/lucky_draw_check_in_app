import React from "react";
import { Card } from "./card";

interface LuckyDrawItemBigDisplayProps {
  imgLink: string;
  title: string;
  desc: string;
}

const LuckyDrawItemBigDisplay: React.FC<LuckyDrawItemBigDisplayProps> = (
  props: LuckyDrawItemBigDisplayProps
) => {
  const { imgLink, title, desc } = props;
  return (
    <Card
      className="overflow-hidden flex h-[90vh]"
      title="Lucky Draw"
    >
      <div className="h-full w-full grid md:grid-cols-2 overflow-hidden">
        <div className=" h-full w-full bg-white flex items-center justify-center p-1">
          <img src={imgLink} alt="Lucky Draw Item Image" />
        </div>
        <div className="shadow-xl flex items-center p-6 rounded-xl">
          <div className="flex flex-col gap-4">
            <h1 className="text-7xl font-bold">{title}</h1>
            <h2 className="text-6xl font-semibold text-zinc-700">{desc}</h2>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default LuckyDrawItemBigDisplay;
