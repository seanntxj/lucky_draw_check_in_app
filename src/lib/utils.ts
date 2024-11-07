import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const shuffle = (array: string[]) => { 
  const shuffled = array.slice(); 
  let currentIndex = shuffled.length; 
  let temporaryValue, randomIndex; 
  while (currentIndex !== 0) { 
    randomIndex = Math.floor(Math.random() * currentIndex); 
    currentIndex -= 1; 
    temporaryValue = shuffled[currentIndex]; 
    shuffled[currentIndex] = shuffled[randomIndex]; 
    shuffled[randomIndex] = temporaryValue; 
  }
  return shuffled; 
}; 