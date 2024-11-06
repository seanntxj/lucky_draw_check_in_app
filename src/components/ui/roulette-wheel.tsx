import React, { useState } from 'react';
import { Button } from './button';

const RouletteWheel = () => {
  const [rotation, setRotation] = useState(0);
  const labels = ['Option 1', 'Option 2', 'Option 3', 'Option 4', 'Option 5', 'Option 6'];

  const spinWheel = () => {
    // Generate a random rotation angle between 1000 and 5000 degrees for dramatic spinning
    const newRotation = rotation + Math.floor(Math.random() * 4000) + 1000;
    setRotation(newRotation);
  };

  return (
    <div >
      <div className="relative w-64 h-64">
        <div
          className="w-full h-full rounded-full border-4 border-blue-500 flex justify-center items-center"
          style={{ transform: `rotate(${rotation}deg)`, transition: 'transform 4s cubic-bezier(0.33, 1, 0.68, 1)' }}
        >
          {labels.map((label, index) => {
            const angle = (360 / labels.length) * index;
            return (
              <div
                key={index}
                className="absolute w-1/2 h-1/2 origin-bottom transform"
                style={{ transform: `rotate(${angle}deg)`, transformOrigin: '50% 100%' }}
              >
                <div className="text-center font-bold text-white bg-blue-500 rounded-md py-1">
                  {label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <Button
        onClick={spinWheel}
      >
        Spin
      </Button>
    </div>
  );
};

export default RouletteWheel;
