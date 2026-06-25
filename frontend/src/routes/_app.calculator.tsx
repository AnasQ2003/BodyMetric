import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import {
  Ruler,
  Weight,
  Calendar,
  Flame,
  Target,
  Activity,
  Save,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { bmiCategory, calcBMI, useHistory, useLastResult, useProfile } from "@/lib/bmi-store";
import { RiskMeter } from "@/components/charts";

export const Route = createFileRoute("/_app/calculator")({ component: CalculatorPage });

type Unit = "metric" | "imperial";

function CalculatorPage() {
  const { profile, update } = useProfile();
  const { add } = useHistory();
  const { set } = useLastResult();
  const navigate = useNavigate();

  const [unit, setUnit] = useState<Unit>("metric");
  const [weight, setWeight] = useState(profile.weight); // kg
  const [heightCm, setHeightCm] = useState(profile.height); // cm
  const [feet, setFeet] = useState(Math.floor(profile.height / 30.48));
  const [inches, setInches] = useState(Math.round((profile.height / 2.54) % 12));
  const [pounds, setPounds] = useState(Math.round(profile.weight * 2.2046));
  const [age, setAge] = useState(profile.age);
  const [gender, setGender] = useState(profile.gender);
  const [waist, setWaist] = useState(82);
  const [neck, setNeck] = useState(38);
  const [hip, setHip] = useState(95);
  const [activity, setActivity] = useState(profile.activityLevel);

  const heightFinal = unit === "metric" ? heightCm : feet * 30.48 + inches * 2.54;
  const weightFinal = unit === "metric" ? weight : pounds / 2.2046;

  const bmi = calcBMI(weightFinal, heightFinal);
  const cat = bmiCategory(bmi);

  const { bmr, tdee, idealLo, idealHi, bfPct, bsa, whr } = useMemo(() => {
    const s = gender === "male" ? 5 : -161;
    const bmr = 10 * weightFinal + 6.25 * heightFinal - 5 * age + s;
    const mult = activity === "high" ? 1.55 : activity === "low" ? 1.2 : 1.375;
    const h = heightFinal / 100;
    const idealLo = +(18.5 * h * h).toFixed(1);
    const idealHi = +(24.9 * h * h).toFixed(1);
    // US Navy body fat
    let bfPct = 0;
    if (gender === "male") {
      bfPct =
        86.01 * Math.log10(Math.max(1, waist - neck)) -
        70.041 * Math.log10(Math.max(1, heightFinal)) +
        36.76;
    } else {
      bfPct =
        163.205 * Math.log10(Math.max(1, waist + hip - neck)) -
        97.684 * Math.log10(Math.max(1, heightFinal)) -
        78.387;
    }
    // Mosteller body surface area
    const bsa = Math.sqrt((heightFinal * weightFinal) / 3600);
    const whr = waist / hip;
    return {
      bmr: Math.round(bmr),
      tdee: Math.round(bmr * mult),
      idealLo,
      idealHi,
      bfPct: +bfPct.toFixed(1),
      bsa: +bsa.toFixed(2),
      whr: +whr.toFixed(2),
    };
  }, [weightFinal, heightFinal, age, gender, activity, waist, neck, hip]);

  const macros = useMemo(
    () => ({
      protein: Math.round((tdee * 0.3) / 4),
      carbs: Math.round((tdee * 0.4) / 4),
      fat: Math.round((tdee * 0.3) / 9),
    }),
    [tdee],
  );

  const save = () => {
    const entry = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      weight: +weightFinal.toFixed(1),
      height: Math.round(heightFinal),
      age,
      gender,
      bmi,
      category: cat.label,
    };
    add(entry);
    set(entry);
    update({
      weight: +weightFinal.toFixed(1),
      height: Math.round(heightFinal),
      age,
      gender,
      activityLevel: activity,
    });
    navigate({ to: "/result" });
  };

  return (
    <div className="space-y-4">
      {/* Hero — dark glass card so the colored meter pops */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl p-5 shadow-glow bg-card text-foreground"
      >
        <div className={`absolute inset-0 opacity-90 ${cat.gradient}`} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.35),transparent_60%)]" />
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/20 blur-2xl animate-blob" />

        <div className="relative text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-widest opacity-85">Full body metrics</p>
              <h2 className="font-display text-3xl font-black mt-0.5">
                {bmi.toFixed(1)} <span className="text-sm font-medium opacity-85">BMI</span>
              </h2>
              <p className="text-xs opacity-90 mt-0.5">
                {cat.label} · ideal {idealLo}–{idealHi} kg
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="rounded-xl bg-white/20 backdrop-blur px-2 py-1.5">
                <p className="font-display font-black text-sm">{bmr}</p>
                <p className="text-[8px] uppercase opacity-80">BMR</p>
              </div>
              <div className="rounded-xl bg-white/20 backdrop-blur px-2 py-1.5">
                <p className="font-display font-black text-sm">{tdee}</p>
                <p className="text-[8px] uppercase opacity-80">TDEE</p>
              </div>
            </div>
          </div>

          {/* Meter sits on a soft white inner card for readability */}
          <div className="relative mt-3 rounded-2xl bg-white/95 dark:bg-card/95 p-2 text-foreground shadow-soft">
            <div className="grid place-items-center">
              <RiskMeter value={bmi} color={cat.color} />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Unit toggle */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-2 gap-1 rounded-2xl bg-secondary p-1"
      >
        {(["metric", "imperial"] as Unit[]).map((u) => (
          <button
            key={u}
            onClick={() => setUnit(u)}
            className={`relative rounded-xl py-2 text-xs font-bold capitalize transition ${unit === u ? "text-white" : "text-muted-foreground"}`}
          >
            {unit === u && (
              <motion.span
                layoutId="unit-pill"
                className={`absolute inset-0 rounded-xl ${cat.gradient}`}
              />
            )}
            <span className="relative">
              {u === "metric" ? "Metric (kg / cm)" : "Imperial (lb / ft)"}
            </span>
          </button>
        ))}
      </motion.div>

      {/* Inputs */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl bg-card p-5 shadow-soft space-y-4"
      >
        <p className="font-display font-bold flex items-center gap-2">
          <Ruler className="h-4 w-4" /> Height
        </p>
        {unit === "metric" ? (
          <SliderRow value={heightCm} min={120} max={220} unit="cm" onChange={setHeightCm} />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <SliderRow label="ft" value={feet} min={3} max={7} unit="ft" onChange={setFeet} />
            <SliderRow label="in" value={inches} min={0} max={11} unit="in" onChange={setInches} />
          </div>
        )}

        <p className="font-display font-bold flex items-center gap-2 pt-1">
          <Weight className="h-4 w-4" /> Weight
        </p>
        {unit === "metric" ? (
          <SliderRow value={weight} min={20} max={250} unit="kg" onChange={setWeight} />
        ) : (
          <SliderRow value={pounds} min={50} max={500} unit="lb" onChange={setPounds} />
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="font-display font-bold flex items-center gap-2">
              <Calendar className="h-4 w-4" /> Age
            </p>
            <SliderRow value={age} min={1} max={120} unit="yr" onChange={setAge} />
          </div>
          <div>
            <p className="font-display font-bold flex items-center gap-2">
              <Sparkles className="h-4 w-4" /> Gender
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {(["male", "female"] as const).map((g) => (
                <button
                  key={g}
                  onClick={() => setGender(g)}
                  className={`rounded-xl py-2 text-xs font-bold capitalize transition ${gender === g ? `${cat.gradient} text-white shadow-soft` : "bg-secondary"}`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <p className="font-display font-bold flex items-center gap-2">
            <Activity className="h-4 w-4" /> Activity
          </p>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {(["low", "moderate", "high"] as const).map((a) => (
              <button
                key={a}
                onClick={() => setActivity(a)}
                className={`rounded-xl py-2 text-xs font-bold capitalize transition ${activity === a ? `${cat.gradient} text-white shadow-soft` : "bg-secondary"}`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Body composition inputs */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl bg-card p-5 shadow-soft space-y-4"
      >
        <p className="font-display font-bold">Optional: body measurements</p>
        <SliderRow label="Waist" value={waist} min={50} max={160} unit="cm" onChange={setWaist} />
        <SliderRow label="Neck" value={neck} min={25} max={60} unit="cm" onChange={setNeck} />
        {gender === "female" && (
          <SliderRow label="Hip" value={hip} min={60} max={170} unit="cm" onChange={setHip} />
        )}
      </motion.div>

      {/* Results grid */}
      <div className="grid grid-cols-2 gap-3">
        <ResultTile
          icon={Flame}
          label="BMR"
          value={`${bmr}`}
          sub="kcal/day"
          grad="bg-gradient-fire"
        />
        <ResultTile
          icon={Target}
          label="TDEE"
          value={`${tdee}`}
          sub="kcal/day"
          grad="bg-gradient-brand"
        />
        <ResultTile
          icon={Activity}
          label="Body fat"
          value={`${bfPct}%`}
          sub="US Navy"
          grad="bg-gradient-ocean"
        />
        <ResultTile
          icon={Sparkles}
          label="BSA"
          value={`${bsa}`}
          sub="m² (Mosteller)"
          grad="bg-gradient-mint"
        />
        <ResultTile
          icon={Ruler}
          label="Ideal"
          value={`${idealLo}-${idealHi}`}
          sub="kg range"
          grad={cat.gradient}
        />
        <ResultTile
          icon={Weight}
          label="WHR"
          value={`${whr}`}
          sub={whr < 0.9 ? "low risk" : whr < 1 ? "moderate" : "high"}
          grad="bg-gradient-sunset"
        />
      </div>

      {/* Macros */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl bg-card p-5 shadow-soft"
      >
        <p className="font-display font-bold mb-3">Daily macro target (30/40/30)</p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { l: "Protein", v: `${macros.protein}g`, c: "bg-gradient-fire" },
            { l: "Carbs", v: `${macros.carbs}g`, c: "bg-gradient-ocean" },
            { l: "Fat", v: `${macros.fat}g`, c: "bg-gradient-sunset" },
          ].map((m) => (
            <div key={m.l} className={`rounded-2xl p-3 text-white shadow-soft ${m.c}`}>
              <p className="font-display font-black text-lg">{m.v}</p>
              <p className="text-[10px] uppercase tracking-wider opacity-90">{m.l}</p>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-muted-foreground mt-3 leading-snug">
          Calculated from TDEE using the Mifflin–St Jeor equation. Adjust portions to your goal in
          the Goals screen.
        </p>
      </motion.div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => {
            setWeight(profile.weight);
            setHeightCm(profile.height);
            setAge(profile.age);
          }}
          className="flex items-center justify-center gap-2 rounded-2xl bg-secondary py-3 text-sm font-semibold active:scale-95"
        >
          <RotateCcw className="h-4 w-4" /> Reset
        </button>
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={save}
          className={`flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold text-white shadow-glow ${cat.gradient}`}
        >
          <Save className="h-4 w-4" /> Save & view result
        </motion.button>
      </div>
    </div>
  );
}

function SliderRow({ value, min, max, unit, onChange, label }: any) {
  return (
    <div>
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label || ""}</span>
        <span className="font-display font-black text-base">
          {value}
          <span className="text-[10px] text-muted-foreground ml-1">{unit}</span>
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(+e.target.value)}
        className="w-full accent-primary"
      />
    </div>
  );
}

function ResultTile({ icon: Icon, label, value, sub, grad }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-2xl p-3 text-white shadow-soft ${grad}`}
    >
      <Icon className="h-5 w-5 opacity-90" />
      <p className="font-display text-xl font-black mt-2 leading-tight">{value}</p>
      <p className="text-[10px] uppercase tracking-wider opacity-90">{label}</p>
      <p className="text-[9px] opacity-75 mt-0.5">{sub}</p>
    </motion.div>
  );
}
