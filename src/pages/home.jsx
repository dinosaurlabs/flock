import React from "react";
import Button from "../components/Button/Button";
import Typography from "../components/Typography/Typography";
import HeroImg from "../assets/images/home-hero.png";
import PabloWave from "../components/SVGs/Pablo/PabloWave";
import "../App.css";

function Home() {
  return (
    <div className="px-6 text-black pb-28 pt-28 bg-surface dark:bg-surface-dark dark:text-white">
      {/* Hero Section */}
      <div className="flex flex-col gap-24">
        {/* Hero Title */}
        <div className="flex flex-col items-start gap-6">
          <Typography textStyle="display-xl">
            Effortlessly{" "}
            <span className="text-primary-light dark:text-primary-dark">
              Organize and Meet Up in Seconds
            </span>
          </Typography>
          <Typography textStyle="body-lg" color="secondary">
            Flock is a platform that allows you to easily create, manage, and
            join events with your friends and family.
          </Typography>
          <div className="flex gap-4">
            <Button buttonSize="sm" text="Join A Flock" />
            <Button buttonSize="sm" color="secondary" text="Donate" />
          </div>
        </div>
        {/* Hero Image */}
        <div className="relative flex items-center justify-center">
          <img
            src={HeroImg}
            className="z-[1] rounded-xl image-shadow"
            alt="Hero"
          />
          <PabloWave
            className={"absolute -rotate-12 left-[0px] top-[-55px] w-16 h-16"}
          />
          <div className="absolute right-0 top-[-45px]">
            <PabloWave
              style={{ transform: "scaleX(-1) rotate(-12deg)" }}
              className="size-16"
              bodyColor="#FFAA00"
              pupilColor="#6A4804"
            />
          </div>
        </div>
      </div>

      {/* Hero section (Wil and Gannett) */}
      {/* How it works section (Riya and Gunnar)*/}
      {/* Frequently asked section (Nina and Analise)*/}
    </div>
  );
}

export default Home;
