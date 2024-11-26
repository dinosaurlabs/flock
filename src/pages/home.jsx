import React from "react";
import Button from "../components/Button/Button";
import Typography from "../components/Typography/Typography";
import HeroImg from "../assets/images/home-hero.png";
import CreateImg from "../assets/images/home-create.png";
import ShareImg from "../assets/images/home-share.png";
import AvailabilityImg from "../assets/images/home-availability.png";
import PabloWave from "../components/SVGs/Pablo/PabloWave";
import "../App.css";

function Home() {
  return (
    <div className="flex flex-col gap-24 px-6 text-black pb-28 pt-28 bg-surface dark:bg-surface-dark dark:text-white">
      {/* Hero Section */}
      <section className="flex flex-col gap-24">
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
            <Button buttonSize="md" text="Join A Flock" />
            <Button buttonSize="md" color="secondary" text="Donate" />
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
      </section>
      {/* Features Section */}
      <section className="flex flex-col gap-24">
        <div className="flex flex-col items-start gap-14">
          <div className="flex flex-col items-start gap-6">
            <Typography color="primary-light" textStyle="display-lg">
              Create a Flock
            </Typography>
            <Typography textStyle="body-lg" color="secondary">
              Simply select times that work and the dates you are trying to meet
              and we’ll handle the rest. <i>It’s really that simple.</i>
            </Typography>
            <Button buttonSize="md" text="Create a Flock" icon="arrow" />
            <div className="relative flex items-center justify-center">
              <img
                src={CreateImg}
                className="z-[1] rounded-xl image-shadow"
                alt="Hero"
              />
            </div>
          </div>
        </div>
      </section>
      {/* How it works section (Riya and Gunnar)*/}
      <section className="flex flex-col gap-24">
        <div className="flex flex-col items-start gap-14">
          <div className="flex flex-col items-start gap-6">
            <Typography color="primary-light" textStyle="display-lg">
              Select Availability
            </Typography>
            <Typography textStyle="body-lg" color="secondary">
              Add your availability with the option of importing your google
              calendar. Don’t worry <i>we don’t collect your information!</i>
            </Typography>
            <Button buttonSize="md" text="Join A Flock" icon="arrow" />
            <div className="relative flex items-center justify-center">
              <img
                src={AvailabilityImg}
                className="z-[1] rounded-xl image-shadow"
                alt="Hero"
              />
            </div>
          </div>
        </div>
      </section>
      <section className="flex flex-col gap-24">
        <div className="flex flex-col items-start gap-14">
          <div className="flex flex-col items-start gap-6">
            <Typography color="primary-light" textStyle="display-lg">
              Collect and Share
            </Typography>
            <Typography textStyle="body-lg" color="secondary">
              View the groups availability and share what time works best with
              the group.
              <i>Now go and create your flock!</i>
            </Typography>
            <Button buttonSize="md" text="Create a Flock" icon="arrow" />
            <div className="relative flex items-center justify-center">
              <img
                src={ShareImg}
                className="z-[1] rounded-xl image-shadow"
                alt="Hero"
              />
            </div>
          </div>
        </div>
      </section>
      {/* Frequently asked section (Nina and Analise)*/}
      <Typography textStyle="display-lg">Frequently Asked</Typography>
    </div>
  );
}

export default Home;
