import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Member, WinnerWheelProps } from "@/types";
import { motion, AnimatePresence } from "motion/react";
import { Trophy, Sparkles } from "lucide-react";

export default function WinnerWheel({
  eligibleMembers,
  onWinnerSelected,
}: WinnerWheelProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<Member | null>(null);
  const [currentName, setCurrentName] = useState("");

  const spin = async () => {
    if (eligibleMembers.length === 0) return;
    setIsSpinning(true);
    setWinner(null);

    let count = 0;
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * eligibleMembers.length);
      setCurrentName(eligibleMembers[randomIndex].full_name);
      count++;

      if (count > 30) {
        clearInterval(interval);
        const finalWinner =
          eligibleMembers[Math.floor(Math.random() * eligibleMembers.length)];
        setWinner(finalWinner);
        setIsSpinning(false);
        onWinnerSelected(finalWinner);
      }
    }, 100);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] space-y-8">
      <AnimatePresence mode="wait">
        {isSpinning ? (
          <motion.div
            key="spinning"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            className="text-4xl font-black text-amber-500 italic"
          >
            {currentName}
          </motion.div>
        ) : winner ? (
          <motion.div
            key="winner"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4"
          >
            <div className="bg-amber-500/10 p-4 rounded-full inline-block">
              <Trophy className="w-12 h-12 text-amber-500" />
            </div>
            <h2 className="text-3xl font-bold">{winner.full_name}</h2>
            <p className="text-emerald-500 font-medium flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4" /> Winner Selected!
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center space-y-6"
          >
            <p className="text-muted-foreground">
              {eligibleMembers.length} members eligible for this round
            </p>
            <Button
              onClick={spin}
              size="lg"
              className="bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold px-8"
              disabled={eligibleMembers.length === 0}
            >
              Spin the Wheel
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
