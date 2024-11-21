import React from "react";
import Typography from "../components/TextStyles/Typography";
import heroImage from "../assets/images/home-hero.png"
import Pablo from "../components/SVGs/Pablo/Pablo.jsx";
import Button from"../components/Button";

function Home() {
  return (
    <div className="min-h-screen text-black bg-surface dark:bg-surface-dark dark:text-white">
      {/* Hero section (Wil and Gannett) */
        <>
            <div style={{width: 350}} className="flex flex-col gap-4" property="wrap">
              
              {/* heading text*/}
              <Typography textStyle="display-xl">
                  Effortlessly
                  <br />
                  <span class="text-primary">
                    Organize and Meet Up in Seconds
                  </span>
              </Typography>

              {/* body text*/}
              <Typography textStyle="body-lg, text-secondary">
                Flock lets you organize and join meetups in just a few clicks. Imagine When2Meet with a better design and user experience.
              </Typography>

              <div className="flex gap-4">
                <Button buttonSize="md" text="Join A Flock" />
                <Button buttonSize="md" color="secondary" text="Donate" />
              </div>

              <Pablo style={{ }}>

              </Pablo>
              <img src={heroImage} alt="Hero image." style={{borderRadius: '15px'}}>

              </img>
          </div>
        </>
      }

    </div>
  );
}

export default Home;
