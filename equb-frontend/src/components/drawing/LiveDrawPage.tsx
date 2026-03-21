import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, ArrowLeft, Sparkles, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import type { Member, EqubGroup } from "@/types";

export default function LiveDrawPage() {
  const [isDrawing, setIsDrawing] = useState(false);
  const [winner, setWinner] = useState<Member | null>(null);
  const [currentName, setCurrentName] = useState("");

  const { data: groups = [] } = useQuery<EqubGroup[]>({
    queryKey: ["equb-groups"],
    queryFn: () => base44.entities.EqubGroup.list("-created_date"),
  });

  const activeGroup = groups[0];

  const { data: members = [] } = useQuery<Member[]>({
    queryKey: ["members", activeGroup?.id],
    queryFn: () => base44.entities.Member.filter({ group_id: activeGroup!.id }),
    enabled: !!activeGroup?.id,
  });

  const eligibleMembers = members.filter((m) => !m.has_won);

  const startDraw = () => {
    if (eligibleMembers.length === 0) return;

    setIsDrawing(true);
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
        setIsDrawing(false);
      }
    }, 100);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="absolute top-8 left-8">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
      </div>

      <div className="max-w-2xl w-full space-y-8 text-center">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tighter text-gold flex items-center justify-center gap-3">
            <Trophy className="w-10 h-10" /> Live Gold Draw
          </h1>
          <p className="text-muted-foreground">
            Round #{activeGroup?.current_round || 1} · {activeGroup?.name}
          </p>
        </div>

        <Card className="border-2 border-amber-500/20 bg-card/50 backdrop-blur-xl overflow-hidden relative">
          <div className="absolute inset-0 bg-gold-gradient opacity-5 pointer-events-none" />
          <CardContent className="py-20 flex flex-col items-center justify-center min-h-[400px]">
            <AnimatePresence mode="wait">
              {isDrawing ? (
                <motion.div
                  key="drawing"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.2 }}
                  className="text-5xl font-black tracking-tighter text-amber-500 italic"
                >
                  {currentName}
                </motion.div>
              ) : winner ? (
                <motion.div
                  key="winner"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="relative">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="absolute -inset-8 bg-amber-500/20 blur-3xl rounded-full"
                    />
                    <div className="relative bg-gold-gradient p-1 rounded-full">
                      <div className="bg-background rounded-full p-8">
                        <Trophy className="w-16 h-16 text-amber-500" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-bold uppercase tracking-widest text-amber-500">
                      Winner Found
                    </p>
                    <h2 className="text-6xl font-black tracking-tighter">
                      {winner.full_name}
                    </h2>
                  </div>
                  <div className="flex gap-3 justify-center">
                    <Button
                      onClick={startDraw}
                      variant="outline"
                      className="border-amber-500/50 text-amber-500"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" /> Redraw
                    </Button>
                    <Button className="bg-gold-gradient text-black font-bold">
                      Confirm Result
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-8"
                >
                  <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto">
                    <Sparkles className="w-10 h-10 text-muted-foreground opacity-40" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg font-medium">Ready for the draw?</p>
                    <p className="text-sm text-muted-foreground">
                      {eligibleMembers.length} eligible members remaining in
                      this group.
                    </p>
                  </div>
                  <Button
                    onClick={startDraw}
                    size="lg"
                    className="bg-gold-gradient text-black font-black px-12 py-8 text-xl rounded-2xl shadow-2xl shadow-amber-500/40 hover:scale-105 transition-transform"
                  >
                    START DRAWING
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-muted/30 border">
            <p className="text-xs text-muted-foreground uppercase">Pool Size</p>
            <p className="text-xl font-bold">
              {activeGroup?.contribution_grams * members.length}g
            </p>
          </div>
          <div className="p-4 rounded-xl bg-muted/30 border">
            <p className="text-xs text-muted-foreground uppercase">Karat</p>
            <p className="text-xl font-bold">
              {activeGroup?.contribution_karat}K
            </p>
          </div>
          <div className="p-4 rounded-xl bg-muted/30 border">
            <p className="text-xs text-muted-foreground uppercase">Eligible</p>
            <p className="text-xl font-bold">{eligibleMembers.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
